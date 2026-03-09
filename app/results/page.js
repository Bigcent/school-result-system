"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { getGrade, getOrdinal, computeClassResults, getTeacherRemark, getHeadTeacherRemark } from "@/lib/helpers";
import { useTheme } from "@/lib/ThemeContext";

export default function ResultsPage() {
  const router = useRouter();
  const { theme, school, user, loading: themeLoading } = useTheme();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [activeTerm, setActiveTerm] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [scores, setScores] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [view, setView] = useState("ranking");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!themeLoading) init();
  }, [themeLoading]);

  const init = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    if (!user) { router.push("/login"); return; }

    const { data: sessions } = await supabase
      .from("sessions")
      .select("*")
      .eq("school_id", user.school_id)
      .eq("is_active", true)
      .single();
    setActiveSession(sessions);

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

    setLoading(false);
  };

  const loadClassResults = async (classId) => {
    setSelectedClassId(classId);
    setSelectedStudentId(null);
    setView("ranking");

    if (!classId || !activeTerm) return;

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

    if (studentData?.length && subjectData?.length) {
      const studentIds = studentData.map((s) => s.id);
      const subjectIds = subjectData.map((s) => s.id);

      const { data: scoreData } = await supabase
        .from("scores")
        .select("*")
        .in("student_id", studentIds)
        .in("subject_id", subjectIds)
        .eq("term_id", activeTerm.id);

      const scoreMap = {};
      (scoreData || []).forEach((s) => {
        scoreMap[`${s.student_id}-${s.subject_id}`] = {
          test1: s.test1,
          test2: s.test2,
          exam: s.exam,
        };
      });
      setScores(scoreMap);
    }
  };

  const classResults = useMemo(() => {
    if (!students.length || !subjects.length) return [];
    return computeClassResults(students, subjects, scores);
  }, [students, subjects, scores]);

  const selectedStudent = selectedStudentId
    ? classResults.find((s) => s.id === selectedStudentId)
    : null;

  const classAvg = classResults.length > 0
    ? (classResults.reduce((a, b) => a + (b.average || 0), 0) / classResults.filter((s) => s.average).length).toFixed(1)
    : "—";

  const className = classes.find((c) => c.id === selectedClassId)?.name || "";

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
        className="text-white px-5 pt-4 pb-5 no-print">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">Results</h1>
            <p className="text-xs text-white/60">{activeSession?.name} — {activeTerm?.name}</p>
          </div>
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => loadClassResults(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold border-0 outline-none"
        >
          <option value="" className="text-gray-800">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id} className="text-gray-800">{cls.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId && classResults.length > 0 && (
        <div className="px-4 py-4">
          {/* View toggle */}
          <div className="flex bg-sand-200 rounded-xl p-1 mb-4 no-print">
            <button
              onClick={() => setView("ranking")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                view === "ranking" ? "bg-white shadow-sm" : "text-gray-500"
              }`}
              style={view === "ranking" ? { color: theme.primary } : {}}
            >📊 Class Ranking</button>
            <button
              onClick={() => setView("report")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                view === "report" ? "bg-white shadow-sm" : "text-gray-500"
              }`}
              style={view === "report" ? { color: theme.primary } : {}}
            >📄 Report Card</button>
          </div>

          {/* ═══ RANKING VIEW ═══ */}
          {view === "ranking" && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Students", value: students.length, color: theme.primary },
                  { label: "Highest", value: classResults[0]?.grandTotal || "—", color: theme.secondary },
                  { label: "Class Avg", value: classAvg, color: theme.accent },
                ].map((card) => (
                  <div key={card.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xl font-extrabold" style={{ color: card.color }}>{card.value}</div>
                    <div className="text-[10px] font-semibold text-gray-400">{card.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-[40px_1.5fr_1fr_1fr_70px] px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide"
                  style={{ background: theme.lightest }}>
                  <div className="text-center">Pos</div>
                  <div>Student</div>
                  <div className="text-center">Total</div>
                  <div className="text-center">Avg</div>
                  <div className="text-center">Fees</div>
                </div>

                {classResults.map((student, idx) => {
                  const posColors = { 1: "#DAA520", 2: "#A8A8A8", 3: "#CD7F32" };
                  return (
                    <div
                      key={student.id}
                      onClick={() => { setSelectedStudentId(student.id); setView("report"); }}
                      className={`grid grid-cols-[40px_1.5fr_1fr_1fr_70px] px-3 py-2.5 items-center border-b border-sand-200 cursor-pointer hover:opacity-80 transition-opacity ${
                        idx % 2 === 0 ? "bg-white" : "bg-sand-50"
                      }`}
                    >
                      <div className="text-center text-sm font-extrabold" style={{ color: posColors[student.position] || "#888" }}>
                        {getOrdinal(student.position)}
                      </div>
                      <div className="text-xs font-semibold">{student.last_name} {student.first_name}</div>
                      <div className="text-center text-sm font-extrabold" style={{ color: theme.primary }}>{student.grandTotal || "—"}</div>
                      <div className="text-center text-xs font-semibold text-gray-500">{student.average ?? "—"}%</div>
                      <div className="text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          student.fees_paid ? "text-green-800" : "bg-red-100 text-red-700"
                        }`} style={student.fees_paid ? { background: theme.light, color: theme.primary } : {}}>
                          {student.fees_paid ? "PAID" : "OWES"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">Tap a student to view report card</p>
            </>
          )}

          {/* ═══ REPORT CARD VIEW ═══ */}
          {view === "report" && (
            <>
              <div className="mb-4 no-print">
                <select
                  value={selectedStudentId || ""}
                  onChange={(e) => setSelectedStudentId(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sand-300 bg-white text-sm font-semibold outline-none"
                  style={{ "--tw-ring-color": theme.primary }}
                >
                  <option value="">— Select Student —</option>
                  {classResults.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.last_name} {s.first_name} ({getOrdinal(s.position)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent ? (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  {/* Report header */}
                  <div style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
                    className="text-white text-center px-5 py-5">
                    <div className="text-lg font-extrabold">{school?.name}</div>
                    <div className="text-[10px] text-white/60 mt-0.5">{school?.motto}</div>
                    <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mt-3"
                      style={{ background: "rgba(255,255,255,0.15)" }}>
                      REPORT CARD — {activeSession?.name} {activeTerm?.name}
                    </div>
                  </div>

                  {/* Student info */}
                  <div className="px-5 py-4 border-b-2 border-sand-200">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Name", value: `${selectedStudent.first_name} ${selectedStudent.last_name}` },
                        { label: "Class", value: className },
                        { label: "Position", value: `${getOrdinal(selectedStudent.position)} of ${students.length}` },
                        { label: "Fees", value: selectedStudent.fees_paid ? "Cleared" : "Outstanding", isRed: !selectedStudent.fees_paid },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</div>
                          <div className={`text-sm font-bold ${item.isRed ? "text-red-600" : "text-gray-800"}`}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject scores */}
                  <div className="px-5">
                    <div className="grid grid-cols-[1.5fr_repeat(5,1fr)] py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b-2 border-sand-200">
                      <div>Subject</div>
                      <div className="text-center">Test 1</div>
                      <div className="text-center">Test 2</div>
                      <div className="text-center">Exam</div>
                      <div className="text-center">Total</div>
                      <div className="text-center">Grade</div>
                    </div>

                    {selectedStudent.subjectResults.map((sr, idx) => (
                      <div
                        key={sr.subject}
                        className={`grid grid-cols-[1.5fr_repeat(5,1fr)] py-2.5 border-b border-sand-100 text-xs ${
                          idx % 2 === 0 ? "" : "bg-sand-50"
                        }`}
                      >
                        <div className="font-semibold">{sr.subject}</div>
                        <div className="text-center text-gray-500">{sr.test1 ?? "—"}</div>
                        <div className="text-center text-gray-500">{sr.test2 ?? "—"}</div>
                        <div className="text-center text-gray-500">{sr.exam ?? "—"}</div>
                        <div className="text-center font-extrabold" style={{ color: theme.primary }}>{sr.total ?? "—"}</div>
                        <div className={`text-center font-bold ${
                          sr.grade === "A" ? "" : sr.grade === "F" ? "text-red-600" : "text-gray-500"
                        }`} style={sr.grade === "A" ? { color: theme.primary } : {}}>{sr.grade ?? "—"}</div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mx-5 mt-4 p-4 rounded-xl" style={{ background: theme.lightest }}>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-xl font-extrabold" style={{ color: theme.primary }}>{selectedStudent.grandTotal}</div>
                        <div className="text-[10px] font-semibold text-gray-400">GRAND TOTAL</div>
                      </div>
                      <div>
                        <div className="text-xl font-extrabold" style={{ color: theme.secondary }}>{selectedStudent.average}%</div>
                        <div className="text-[10px] font-semibold text-gray-400">AVERAGE</div>
                      </div>
                      <div>
                        <div className="text-xl font-extrabold" style={{ color: theme.accent }}>{getOrdinal(selectedStudent.position)}</div>
                        <div className="text-[10px] font-semibold text-gray-400">POSITION</div>
                      </div>
                    </div>
                  </div>

                  {/* Teacher's Remark */}
                  <div className="mx-5 mt-4 p-4 bg-sand-50 rounded-xl border border-sand-200">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Teacher's Remark</div>
                    <div className="text-sm font-medium text-gray-700 italic">
                      "{getTeacherRemark(selectedStudent.average)}"
                    </div>
                    <div className="flex items-end justify-between mt-3 pt-3 border-t border-sand-300">
                      <div>
                        <div className="text-[10px] text-gray-400 font-semibold">Signature</div>
                        <div className="w-32 border-b-2 border-gray-300 mt-4"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-semibold">Date</div>
                        <div className="w-24 border-b-2 border-gray-300 mt-4"></div>
                      </div>
                    </div>
                  </div>

                  {/* Head Teacher's Remark */}
                  <div className="mx-5 mt-3 p-4 bg-sand-50 rounded-xl border border-sand-200">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Head Teacher's Remark</div>
                    <div className="text-sm font-medium text-gray-700 italic">
                      "{getHeadTeacherRemark(selectedStudent.average)}"
                    </div>
                    <div className="flex items-end justify-between mt-3 pt-3 border-t border-sand-300">
                      <div>
                        <div className="text-[10px] text-gray-400 font-semibold">Signature</div>
                        <div className="w-32 border-b-2 border-gray-300 mt-4"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-semibold">Date</div>
                        <div className="w-24 border-b-2 border-gray-300 mt-4"></div>
                      </div>
                    </div>
                  </div>

                  {/* Fees warning */}
                  {!selectedStudent.fees_paid && (
                    <div className="mx-5 mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-700 text-center">
                      ⚠️ RESULT WITHHELD — Outstanding fees must be cleared
                    </div>
                  )}

                  {/* Grade key */}
                  <div className="px-5 py-4 border-t border-sand-200 mt-4">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Grading Scale</div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { grade: "A", range: "70-100%" },
                        { grade: "B", range: "60-69%" },
                        { grade: "C", range: "50-59%" },
                        { grade: "D", range: "40-49%" },
                        { grade: "F", range: "0-39%" },
                      ].map((g) => (
                        <span key={g.grade} className="text-[10px] font-semibold px-2 py-1 rounded-md"
                          style={{ background: theme.lightest, color: theme.primary }}>
                          {g.grade}: {g.range}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Print button */}
                  <div className="p-5 no-print">
                    <button
                      onClick={() => window.print()}
                      className="w-full py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                      style={{ background: theme.primary }}
                    >
                      🖨️ Print Report Card
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                  <div className="text-4xl mb-3">📄</div>
                  <div className="text-sm font-semibold text-gray-500">Select a student to view their report card</div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selectedClassId && classResults.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">
          No scores found. Enter scores first.
        </div>
      )}

      {!selectedClassId && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">
          Select a class to view results.
        </div>
      )}
    </div>
  );
}