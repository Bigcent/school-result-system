"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { getGrade } from "@/lib/helpers";

function ScoresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClass = searchParams.get("class");

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(preselectedClass || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [activeTerm, setActiveTerm] = useState(null);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: user } = await supabase
        .from("users")
        .select("school_id")
        .eq("id", session.user.id)
        .single();

      if (!user) { router.push("/login"); return; }
      setSchoolId(user.school_id);

      const { data: sessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("school_id", user.school_id)
        .eq("is_active", true)
        .single();

      if (sessions) {
        const { data: term } = await supabase
          .from("terms")
          .select("*")
          .eq("session_id", sessions.id)
          .eq("is_active", true)
          .single();
        setActiveTerm(term);
      }

      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", user.school_id)
        .order("sort_order");
      setClasses(classData || []);

      if (preselectedClass) {
        await loadClassData(preselectedClass, null);
      }

      setLoading(false);
    };
    init();
  }, []);

  const loadClassData = async (classId, termId) => {
    const tId = termId || activeTerm?.id;

    const { data: subjectData } = await supabase
      .from("subjects")
      .select("*")
      .eq("class_id", classId)
      .order("sort_order");
    setSubjects(subjectData || []);

    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId)
      .eq("is_active", true)
      .order("last_name");
    setStudents(studentData || []);

    if (tId && studentData?.length && subjectData?.length) {
      const studentIds = studentData.map((s) => s.id);
      const subjectIds = subjectData.map((s) => s.id);

      const { data: scoreData } = await supabase
        .from("scores")
        .select("*")
        .in("student_id", studentIds)
        .in("subject_id", subjectIds)
        .eq("term_id", tId);

      const scoreMap = {};
      (scoreData || []).forEach((s) => {
        scoreMap[`${s.student_id}-${s.subject_id}`] = {
          test1: s.test1,
          test2: s.test2,
          exam: s.exam,
          id: s.id,
        };
      });
      setScores(scoreMap);
    }

    if (subjectData?.length) {
      setSelectedSubjectId(subjectData[0].id);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClassId(classId);
    setScores({});
    setStudents([]);
    setSubjects([]);
    if (classId) {
      await loadClassData(classId, activeTerm?.id);
    }
  };

  const updateScore = useCallback((studentId, field, value) => {
    const max = field === "exam" ? 60 : 20;
    const num = value === "" ? "" : Math.min(Math.max(0, parseInt(value) || 0), max);
    const key = `${studentId}-${selectedSubjectId}`;

    setScores((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value === "" ? "" : num,
      },
    }));
    setSaved(false);
  }, [selectedSubjectId]);

  const getStudentScore = (studentId) => {
    const key = `${studentId}-${selectedSubjectId}`;
    return scores[key] || { test1: "", test2: "", exam: "" };
  };

  const getTotal = (studentId) => {
    const s = getStudentScore(studentId);
    const t1 = s.test1 === "" ? 0 : s.test1;
    const t2 = s.test2 === "" ? 0 : s.test2;
    const ex = s.exam === "" ? 0 : s.exam;
    if (s.test1 === "" && s.test2 === "" && s.exam === "") return null;
    return t1 + t2 + ex;
  };

  const handleSave = async () => {
    if (!activeTerm || !selectedSubjectId) return;
    setSaving(true);

    const upsertData = students
      .map((student) => {
        const s = getStudentScore(student.id);
        if (s.test1 === "" && s.test2 === "" && s.exam === "") return null;
        return {
          student_id: student.id,
          subject_id: selectedSubjectId,
          term_id: activeTerm.id,
          test1: s.test1 === "" ? 0 : s.test1,
          test2: s.test2 === "" ? 0 : s.test2,
          exam: s.exam === "" ? 0 : s.exam,
        };
      })
      .filter(Boolean);

    if (upsertData.length > 0) {
      const { error } = await supabase
        .from("scores")
        .upsert(upsertData, {
          onConflict: "student_id,subject_id,term_id",
        });

      if (error) {
        console.error("Save error:", error);
        alert("Error saving scores. Please try again.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }

    setSaving(false);
  };

  const getSubjectCompletion = (subjectId) => {
    let filled = 0;
    students.forEach((s) => {
      const key = `${s.id}-${subjectId}`;
      const score = scores[key];
      if (score && (score.test1 !== "" || score.test2 !== "" || score.exam !== "")) {
        filled++;
      }
    });
    return { filled, total: students.length, complete: filled === students.length && filled > 0 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-100">
      <div className="bg-gradient-to-br from-forest-800 to-forest-700 text-white px-5 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">Enter Scores</h1>
            <p className="text-xs text-white/60">{activeTerm?.name || "No active term"}</p>
          </div>
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => handleClassChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold border-0 outline-none"
        >
          <option value="" className="text-gray-800">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id} className="text-gray-800">{cls.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId && subjects.length > 0 && (
        <div className="px-4 py-4">
          <div className="mb-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Subject</div>
            <div className="flex gap-2 flex-wrap">
              {subjects.map((subject) => {
                const { filled, total, complete } = getSubjectCompletion(subject.id);
                const isSelected = selectedSubjectId === subject.id;
                return (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubjectId(subject.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      isSelected
                        ? "bg-forest-800 text-white border-forest-800"
                        : complete
                        ? "bg-forest-100 text-forest-800 border-forest-500"
                        : "bg-white text-gray-500 border-sand-300"
                    }`}
                  >
                    {subject.name}
                    {complete && <span className="ml-1">✓</span>}
                    {!complete && filled > 0 && (
                      <span className="ml-1 text-[10px] opacity-60">{filled}/{total}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedSubjectId && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-[minmax(100px,1.5fr)_repeat(4,1fr)] bg-sand-200 px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                <div>Student</div>
                <div className="text-center">Test 1<br /><span className="font-normal opacity-60">/ 20</span></div>
                <div className="text-center">Test 2<br /><span className="font-normal opacity-60">/ 20</span></div>
                <div className="text-center">Exam<br /><span className="font-normal opacity-60">/ 60</span></div>
                <div className="text-center">Total<br /><span className="font-normal opacity-60">/ 100</span></div>
              </div>

              {students.map((student, idx) => {
                const s = getStudentScore(student.id);
                const total = getTotal(student.id);
                const gradeInfo = total !== null ? getGrade(total) : null;

                return (
                  <div
                    key={student.id}
                    className={`grid grid-cols-[minmax(100px,1.5fr)_repeat(4,1fr)] px-3 py-2 items-center border-b border-sand-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-sand-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        student.fees_paid ? "bg-forest-100 text-forest-800" : "bg-red-100 text-red-700"
                      }`}>
                        {student.first_name[0]}{student.last_name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">
                          {student.last_name} {student.first_name}
                        </div>
                        {!student.fees_paid && (
                          <div className="text-[9px] text-red-600 font-bold">OWES</div>
                        )}
                      </div>
                    </div>

                    {["test1", "test2", "exam"].map((field) => (
                      <div key={field} className="flex justify-center">
                        <input
                          type="number"
                          min="0"
                          max={field === "exam" ? 60 : 20}
                          value={s[field]}
                          onChange={(e) => updateScore(student.id, field, e.target.value)}
                          placeholder="—"
                          className="w-12 py-1.5 text-center text-sm font-semibold bg-sand-50 border-2 border-sand-300 rounded-lg outline-none focus:border-forest-700 transition-colors"
                        />
                      </div>
                    ))}

                    <div className="text-center">
                      <div className={`text-base font-extrabold ${
                        total === null ? "text-gray-300"
                          : gradeInfo.grade === "A" ? "text-forest-800"
                          : gradeInfo.grade === "F" ? "text-red-600"
                          : "text-gray-600"
                      }`}>
                        {total ?? "—"}
                      </div>
                      {gradeInfo && (
                        <div className="text-[10px] font-semibold text-gray-400">{gradeInfo.grade}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full mt-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
              saved
                ? "bg-forest-500 text-white"
                : "bg-forest-800 text-white hover:bg-forest-700"
            } disabled:opacity-50`}
          >
            {saving ? "Saving..." : saved ? "✓ Scores Saved!" : "Save Scores"}
          </button>
        </div>
      )}

      {selectedClassId && subjects.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">
          No subjects found for this class. Add subjects in Supabase.
        </div>
      )}

      {!selectedClassId && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">
          Select a class to start entering scores.
        </div>
      )}
    </div>
  );
}

export default function ScoresPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ScoresContent />
    </Suspense>
  );
}