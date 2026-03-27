"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { getGrade } from "@/lib/helpers";
import { useTheme } from "@/lib/ThemeContext";

function ScoresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClass = searchParams.get("class");
  const { theme, school, user, loading: themeLoading } = useTheme();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(preselectedClass || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [activeTerm, setActiveTerm] = useState(null);
  const [scores, setScores] = useState({});
  const [originalScores, setOriginalScores] = useState({}); // Track what was loaded from DB
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // School default score structure
  const schoolTest1Max = school?.test1_max || 20;
  const schoolTest2Max = school?.test2_max || 20;
  const schoolExamMax = school?.exam_max || 60;

  // Get max values for the currently selected subject (per-subject override or school default)
  const getSubjectMaxValues = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return {
      test1Max: subject?.test1_max || schoolTest1Max,
      test2Max: subject?.test2_max || schoolTest2Max,
      examMax: subject?.exam_max || schoolExamMax,
    };
  };

  const currentMax = getSubjectMaxValues(selectedSubjectId);
  const totalMax = currentMax.test1Max + currentMax.test2Max + currentMax.examMax;

  useEffect(() => {
    if (!themeLoading) init();
  }, [themeLoading]);

  const init = async () => {
    if (!user) { router.push("/login"); return; }

    const { data: sessions } = await supabase
      .from("sessions").select("id")
      .eq("school_id", user.school_id).eq("is_active", true).single();

    if (sessions) {
      const { data: term } = await supabase
        .from("terms").select("*")
        .eq("session_id", sessions.id).eq("is_active", true).single();
      setActiveTerm(term);
    }

    const { data: classData } = await supabase
      .from("classes").select("*")
      .eq("school_id", user.school_id).order("sort_order");
    setClasses(classData || []);

    if (preselectedClass) {
      await loadClassData(preselectedClass, null);
    }
    setLoading(false);
  };

  const loadClassData = async (classId, termId) => {
    const tId = termId || activeTerm?.id;

    const { data: subjectData } = await supabase
      .from("subjects").select("*")
      .eq("class_id", classId).order("sort_order");
    setSubjects(subjectData || []);

    const { data: studentData } = await supabase
      .from("students").select("*")
      .eq("class_id", classId).eq("is_active", true).order("last_name");
    setStudents(studentData || []);

    if (tId && studentData?.length && subjectData?.length) {
      const studentIds = studentData.map(s => s.id);
      const subjectIds = subjectData.map(s => s.id);

      const { data: scoreData } = await supabase
        .from("scores").select("*")
        .in("student_id", studentIds).in("subject_id", subjectIds).eq("term_id", tId);

      const scoreMap = {};
      (scoreData || []).forEach(s => {
        scoreMap[`${s.student_id}-${s.subject_id}`] = {
          test1: s.test1,
          test2: s.test2,
          exam: s.exam,
          id: s.id,
        };
      });
      setScores(scoreMap);
      // Store a deep copy of original scores to compare later
      setOriginalScores(JSON.parse(JSON.stringify(scoreMap)));
    } else {
      setScores({});
      setOriginalScores({});
    }

    if (subjectData?.length) {
      setSelectedSubjectId(subjectData[0].id);
    }
  };

  const handleClassChange = async (classId) => {
    setSelectedClassId(classId);
    setScores({});
    setOriginalScores({});
    setStudents([]);
    setSubjects([]);
    if (classId) {
      await loadClassData(classId, activeTerm?.id);
    }
  };

  const updateScore = useCallback((studentId, field, value) => {
    const max = field === "exam" ? currentMax.examMax : field === "test2" ? currentMax.test2Max : currentMax.test1Max;
    const num = value === "" ? "" : Math.min(Math.max(0, parseInt(value) || 0), max);
    const key = `${studentId}-${selectedSubjectId}`;

    setScores(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value === "" ? "" : num,
      },
    }));
    setSaved(false);
  }, [selectedSubjectId, currentMax]);

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

    const toUpsert = [];
    const toDelete = [];

    for (const student of students) {
      const key = `${student.id}-${selectedSubjectId}`;
      const current = scores[key];
      const original = originalScores[key];

      const isEmpty = !current || (current.test1 === "" && current.test2 === "" && current.exam === "");
      const hadData = original && (original.test1 !== "" || original.test2 !== "" || original.exam !== "");

      if (isEmpty && hadData && original.id) {
        // Student had scores before but now cleared — delete from database
        toDelete.push(original.id);
      } else if (!isEmpty) {
        // Student has scores — upsert
        toUpsert.push({
          student_id: student.id,
          subject_id: selectedSubjectId,
          term_id: activeTerm.id,
          test1: current.test1 === "" ? 0 : current.test1,
          test2: current.test2 === "" ? 0 : current.test2,
          exam: current.exam === "" ? 0 : current.exam,
        });
      }
    }

    let hasError = false;

    // Delete cleared scores
    if (toDelete.length > 0) {
      const { error } = await supabase
        .from("scores")
        .delete()
        .in("id", toDelete);
      if (error) {
        console.error("Delete error:", error);
        hasError = true;
      }
    }

    // Upsert remaining scores
    if (toUpsert.length > 0) {
      const { error } = await supabase
        .from("scores")
        .upsert(toUpsert, { onConflict: "student_id,subject_id,term_id" });
      if (error) {
        console.error("Upsert error:", error);
        hasError = true;
      }
    }

    if (hasError) {
      alert("Error saving some scores. Please try again.");
    } else {
      // Reload scores from DB to confirm what was saved
      await reloadScoresForSubject();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setSaving(false);
  };

  // Reload scores from database after saving to confirm state
  const reloadScoresForSubject = async () => {
    if (!activeTerm || !students.length) return;

    const studentIds = students.map(s => s.id);
    const subjectIds = subjects.map(s => s.id);

    const { data: scoreData } = await supabase
      .from("scores").select("*")
      .in("student_id", studentIds).in("subject_id", subjectIds).eq("term_id", activeTerm.id);

    const scoreMap = {};
    (scoreData || []).forEach(s => {
      scoreMap[`${s.student_id}-${s.subject_id}`] = {
        test1: s.test1,
        test2: s.test2,
        exam: s.exam,
        id: s.id,
      };
    });
    setScores(scoreMap);
    setOriginalScores(JSON.parse(JSON.stringify(scoreMap)));
  };

  const getSubjectCompletion = (subjectId) => {
    let filled = 0;
    students.forEach(s => {
      const key = `${s.id}-${subjectId}`;
      const score = scores[key];
      if (score && (score.test1 !== "" || score.test2 !== "" || score.exam !== "")) filled++;
    });
    return { filled, total: students.length, complete: filled === students.length && filled > 0 };
  };

  // Check if current subject has custom structure
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const hasCustomStructure = selectedSubject && (selectedSubject.test1_max || selectedSubject.test2_max || selectedSubject.exam_max);

  if (loading || themeLoading) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${theme.primary} transparent ${theme.primary} ${theme.primary}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-100">
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
        className="text-white px-5 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">Enter Scores</h1>
            <p className="text-xs text-white/60">
              {activeTerm?.name || "No active term"}
              {hasCustomStructure
                ? ` • ${selectedSubject?.name}: ${currentMax.test1Max}-${currentMax.test2Max}-${currentMax.examMax}`
                : ` • Structure: ${schoolTest1Max}-${schoolTest2Max}-${schoolExamMax}`
              }
            </p>
          </div>
        </div>

        <select value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold border-0 outline-none">
          <option value="" className="text-gray-800">Select Class</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id} className="text-gray-800">{cls.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId && subjects.length > 0 && (
        <div className="px-4 py-4">
          {/* Subject pills */}
          <div className="mb-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Subject</div>
            <div className="flex gap-2 flex-wrap">
              {subjects.map(subject => {
                const { filled, total, complete } = getSubjectCompletion(subject.id);
                const isSelected = selectedSubjectId === subject.id;
                const hasCustom = subject.test1_max || subject.test2_max || subject.exam_max;
                return (
                  <button key={subject.id} onClick={() => setSelectedSubjectId(subject.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
                    style={{
                      background: isSelected ? theme.primary : complete ? theme.lightest : "white",
                      color: isSelected ? "white" : complete ? theme.primary : "#999",
                      borderColor: isSelected ? theme.primary : complete ? theme.accent : "#E8E4DD",
                    }}>
                    {subject.name}
                    {hasCustom && <span className="ml-1 text-[8px] opacity-60">⚙️</span>}
                    {complete && <span className="ml-1">✓</span>}
                    {!complete && filled > 0 && <span className="ml-1 text-[10px] opacity-60">{filled}/{total}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom structure notice */}
          {hasCustomStructure && (
            <div className="mb-3 px-3 py-2 rounded-lg text-[10px] font-semibold"
              style={{ background: theme.lightest, color: theme.primary }}>
              ⚙️ {selectedSubject?.name} uses custom structure: {currentMax.test1Max}-{currentMax.test2Max}-{currentMax.examMax} (instead of {schoolTest1Max}-{schoolTest2Max}-{schoolExamMax})
            </div>
          )}

          {/* Score Grid */}
          {selectedSubjectId && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[minmax(100px,1.5fr)_repeat(4,1fr)] px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide"
                style={{ background: theme.lightest }}>
                <div>Student</div>
                <div className="text-center">Test 1<br /><span className="font-normal opacity-60">/ {currentMax.test1Max}</span></div>
                <div className="text-center">Test 2<br /><span className="font-normal opacity-60">/ {currentMax.test2Max}</span></div>
                <div className="text-center">Exam<br /><span className="font-normal opacity-60">/ {currentMax.examMax}</span></div>
                <div className="text-center">Total<br /><span className="font-normal opacity-60">/ {totalMax}</span></div>
              </div>

              {/* Student rows */}
              {students.map((student, idx) => {
                const s = getStudentScore(student.id);
                const total = getTotal(student.id);
                const gradeInfo = total !== null ? getGrade(total) : null;
                const showFees = school?.show_fees !== false;

                return (
                  <div key={student.id}
                    className={`grid grid-cols-[minmax(100px,1.5fr)_repeat(4,1fr)] px-3 py-2 items-center border-b border-sand-200 ${idx % 2 === 0 ? "bg-white" : "bg-sand-50"}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: !showFees || student.fees_paid ? theme.light : "#FEE2E2",
                          color: !showFees || student.fees_paid ? theme.primary : "#DC2626",
                        }}>
                        {student.first_name[0]}{student.last_name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{student.last_name} {student.first_name}</div>
                        {showFees && !student.fees_paid && <div className="text-[9px] text-red-600 font-bold">OWES</div>}
                      </div>
                    </div>

                    {[
                      { field: "test1", max: currentMax.test1Max },
                      { field: "test2", max: currentMax.test2Max },
                      { field: "exam", max: currentMax.examMax },
                    ].map(({ field, max }) => (
                      <div key={field} className="flex justify-center">
                        <input type="number" min="0" max={max} value={s[field]}
                          onChange={(e) => updateScore(student.id, field, e.target.value)}
                          placeholder="—"
                          className="w-12 py-1.5 text-center text-sm font-semibold bg-sand-50 border-2 border-sand-300 rounded-lg outline-none transition-colors"
                          onFocus={(e) => e.target.style.borderColor = theme.primary}
                          onBlur={(e) => e.target.style.borderColor = "#E8E4DD"} />
                      </div>
                    ))}

                    <div className="text-center">
                      <div className={`text-base font-extrabold ${
                        total === null ? "text-gray-300"
                          : gradeInfo?.grade === "A" ? "" : gradeInfo?.grade === "F" ? "text-red-600" : "text-gray-600"
                      }`} style={gradeInfo?.grade === "A" ? { color: theme.primary } : {}}>
                        {total ?? "—"}
                      </div>
                      {gradeInfo && <div className="text-[10px] font-semibold text-gray-400">{gradeInfo.grade}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving}
            className="w-full mt-4 py-3.5 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-50"
            style={{ background: saved ? theme.accent : theme.primary }}>
            {saving ? "Saving..." : saved ? "✓ Scores Saved!" : "Save Scores"}
          </button>
        </div>
      )}

      {selectedClassId && subjects.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">No subjects for this class. Add subjects in Admin → Subjects.</div>
      )}
      {!selectedClassId && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">Select a class to start entering scores.</div>
      )}
    </div>
  );
}

export default function ScoresPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ScoresContent />
    </Suspense>
  );
}