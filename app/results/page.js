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
  const [attendance, setAttendance] = useState({});
  const [daysOpened, setDaysOpened] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [view, setView] = useState("ranking");
  const [loading, setLoading] = useState(true);

  const test1Max = school?.test1_max || 20;
  const test2Max = school?.test2_max || 20;
  const examMax = school?.exam_max || 60;
  const showPosition = school?.show_position !== false;
  const showFees = school?.show_fees !== false;
  const logoUrl = school?.logo_url || null;

  useEffect(() => {
    if (!themeLoading) init();
  }, [themeLoading]);

  const init = async () => {
    if (!user) { router.push("/login"); return; }

    const { data: sessions } = await supabase
      .from("sessions").select("*")
      .eq("school_id", user.school_id).eq("is_active", true).single();
    setActiveSession(sessions);

    if (sessions) {
      const { data: term } = await supabase
        .from("terms").select("*")
        .eq("session_id", sessions.id).eq("is_active", true).single();
      setActiveTerm(term);
      setDaysOpened(term?.days_opened || 0);
    }

    const { data: classData } = await supabase
      .from("classes").select("*")
      .eq("school_id", user.school_id).order("sort_order");
    setClasses(classData || []);
    setLoading(false);
  };

  const loadClassResults = async (classId) => {
    setSelectedClassId(classId);
    setSelectedStudentId(null);
    setView("ranking");
    if (!classId || !activeTerm) return;

    const { data: subjectData } = await supabase
      .from("subjects").select("*")
      .eq("class_id", classId).order("sort_order");
    setSubjects(subjectData || []);

    const { data: studentData } = await supabase
      .from("students").select("*")
      .eq("class_id", classId).eq("is_active", true).order("last_name");
    setStudents(studentData || []);

    if (studentData?.length && subjectData?.length) {
      const sids = studentData.map(s => s.id);
      const subids = subjectData.map(s => s.id);

      const { data: scoreData } = await supabase
        .from("scores").select("*")
        .in("student_id", sids).in("subject_id", subids).eq("term_id", activeTerm.id);
      const scoreMap = {};
      (scoreData || []).forEach(s => {
        scoreMap[`${s.student_id}-${s.subject_id}`] = { test1: s.test1, test2: s.test2, exam: s.exam };
      });
      setScores(scoreMap);

      const { data: attData } = await supabase
        .from("attendance").select("*")
        .in("student_id", sids).eq("term_id", activeTerm.id);
      const attMap = {};
      (attData || []).forEach(a => { attMap[a.student_id] = a.days_present; });
      setAttendance(attMap);
    }
  };

  const classResults = useMemo(() => {
    if (!students.length || !subjects.length) return [];
    return computeClassResults(students, subjects, scores);
  }, [students, subjects, scores]);

  const selectedStudent = selectedStudentId
    ? classResults.find(s => s.id === selectedStudentId)
    : null;

  const classAvg = classResults.length > 0
    ? (classResults.reduce((a, b) => a + (b.average || 0), 0) / classResults.filter(s => s.average).length).toFixed(1)
    : "—";

  const className = classes.find(c => c.id === selectedClassId)?.name || "";

  // Get subject total for a student
  const getSubjectTotal = (studentId, subjectId) => {
    const key = `${studentId}-${subjectId}`;
    const s = scores[key];
    if (!s) return null;
    return (s.test1 || 0) + (s.test2 || 0) + (s.exam || 0);
  };

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
        <select value={selectedClassId} onChange={(e) => loadClassResults(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold border-0 outline-none">
          <option value="" className="text-gray-800">Select Class</option>
          {classes.map(c => (
            <option key={c.id} value={c.id} className="text-gray-800">{c.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId && classResults.length > 0 && (
        <div className="px-4 py-4">
          {/* View Toggle */}
          <div className="flex bg-sand-200 rounded-xl p-1 mb-4 no-print">
            <button onClick={() => setView("ranking")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === "ranking" ? "bg-white shadow-sm" : "text-gray-500"}`}
              style={view === "ranking" ? { color: theme.primary } : {}}>
              📊 Broadsheet
            </button>
            <button onClick={() => setView("report")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === "report" ? "bg-white shadow-sm" : "text-gray-500"}`}
              style={view === "report" ? { color: theme.primary } : {}}>
              📄 Report Card
            </button>
          </div>

          {/* ═══ BROADSHEET VIEW ═══ */}
          {view === "ranking" && (
            <>
              {/* Print Header */}
              <div className="hidden print:block text-center mb-3">
                <div className="flex items-center justify-center gap-3 mb-1">
                  {logoUrl && <img src={logoUrl} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />}
                  <div>
                    <div className="text-lg font-extrabold" style={{ color: theme.primary }}>{school?.name}</div>
                    {school?.address && <div className="text-xs text-gray-500">{school.address}</div>}
                  </div>
                </div>
                <div className="text-sm font-bold mt-1" style={{ color: theme.secondary }}>
                  BROADSHEET REPORT — {className} — {activeSession?.name} | {activeTerm?.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">{students.length} students</div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mb-4 no-print">
                {[
                  { label: "Students", value: students.length, color: theme.primary },
                  { label: "Highest", value: classResults[0]?.grandTotal || "—", color: theme.secondary },
                  { label: "Class Avg", value: classAvg, color: theme.accent },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-xl font-extrabold" style={{ color: card.color }}>{card.value}</div>
                    <div className="text-[10px] font-semibold text-gray-400">{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Broadsheet Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "10px" }}>
                  <thead>
                    <tr>
                      <th style={{
                        position: "sticky", left: 0, zIndex: 10,
                        background: theme.primary, color: "white",
                        padding: "8px 6px", fontWeight: 800, fontSize: "9px",
                        textAlign: "center", minWidth: 30, borderRight: "2px solid rgba(255,255,255,0.2)",
                      }}>
                        S/N
                      </th>
                      <th style={{
                        position: "sticky", left: 30, zIndex: 10,
                        background: theme.primary, color: "white",
                        padding: "8px 6px", fontWeight: 800, fontSize: "9px",
                        textAlign: "left", minWidth: 120, borderRight: "2px solid rgba(255,255,255,0.2)",
                      }}>
                        NAME OF STUDENT
                      </th>
                      {subjects.map(sub => (
                        <th key={sub.id} style={{
                          background: theme.secondary, color: "white",
                          padding: "6px 4px", fontWeight: 700, fontSize: "8px",
                          textAlign: "center", minWidth: 45,
                          borderRight: "1px solid rgba(255,255,255,0.15)",
                          textTransform: "uppercase", lineHeight: 1.2,
                          writingMode: subjects.length > 10 ? "vertical-rl" : "horizontal-tb",
                          transform: subjects.length > 10 ? "rotate(180deg)" : "none",
                          height: subjects.length > 10 ? 80 : "auto",
                        }}>
                          {sub.name}
                        </th>
                      ))}
                      <th style={{
                        background: theme.primary, color: "white",
                        padding: "6px 4px", fontWeight: 800, fontSize: "9px",
                        textAlign: "center", minWidth: 45, borderLeft: "2px solid rgba(255,255,255,0.3)",
                      }}>
                        TOTAL
                      </th>
                      <th style={{
                        background: theme.primary, color: "white",
                        padding: "6px 4px", fontWeight: 800, fontSize: "9px",
                        textAlign: "center", minWidth: 40,
                      }}>
                        AVG
                      </th>
                      <th style={{
                        background: theme.primary, color: "white",
                        padding: "6px 4px", fontWeight: 800, fontSize: "9px",
                        textAlign: "center", minWidth: 35,
                      }}>
                        POS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classResults.map((student, idx) => {
                      const posColors = { 1: "#DAA520", 2: "#A8A8A8", 3: "#CD7F32" };
                      return (
                        <tr key={student.id}
                          onClick={() => { setSelectedStudentId(student.id); setView("report"); }}
                          style={{
                            cursor: "pointer",
                            background: idx % 2 === 0 ? "white" : "#FAFAF7",
                            borderBottom: "1px solid #F0EDE8",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = theme.lightest}
                          onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#FAFAF7"}
                        >
                          <td style={{
                            position: "sticky", left: 0, zIndex: 5,
                            background: idx % 2 === 0 ? "white" : "#FAFAF7",
                            padding: "6px", textAlign: "center", fontWeight: 700,
                            fontSize: "9px", color: "#888",
                            borderRight: "2px solid #F0EDE8",
                          }}>
                            {idx + 1}
                          </td>
                          <td style={{
                            position: "sticky", left: 30, zIndex: 5,
                            background: idx % 2 === 0 ? "white" : "#FAFAF7",
                            padding: "6px", fontWeight: 700, fontSize: "10px",
                            borderRight: "2px solid #F0EDE8",
                            whiteSpace: "nowrap",
                          }}>
                            {student.last_name} {student.first_name}
                          </td>
                          {subjects.map(sub => {
                            const total = getSubjectTotal(student.id, sub.id);
                            const grade = total !== null ? getGrade(total) : null;
                            return (
                              <td key={sub.id} style={{
                                padding: "6px 4px", textAlign: "center",
                                fontWeight: 700, fontSize: "10px",
                                borderRight: "1px solid #F0EDE8",
                                color: total === null ? "#ccc"
                                  : grade?.grade === "A" ? theme.primary
                                  : grade?.grade === "F" ? "#DC2626"
                                  : "#444",
                              }}>
                                {total ?? "—"}
                              </td>
                            );
                          })}
                          <td style={{
                            padding: "6px 4px", textAlign: "center",
                            fontWeight: 900, fontSize: "11px",
                            color: theme.primary,
                            borderLeft: "2px solid #F0EDE8",
                          }}>
                            {student.grandTotal || "—"}
                          </td>
                          <td style={{
                            padding: "6px 4px", textAlign: "center",
                            fontWeight: 700, fontSize: "10px",
                            color: theme.secondary,
                          }}>
                            {student.average ?? "—"}%
                          </td>
                          <td style={{
                            padding: "6px 4px", textAlign: "center",
                            fontWeight: 900, fontSize: "11px",
                            color: posColors[student.position] || "#888",
                          }}>
                            {getOrdinal(student.position)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-gray-400 text-center mt-2 no-print">Tap a student to view report card • Scroll right to see all subjects</p>

              <button onClick={() => window.print()}
                className="w-full mt-4 py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 no-print"
                style={{ background: theme.primary }}>
                🖨️ Print Broadsheet
              </button>
            </>
          )}

          {/* ═══ REPORT CARD VIEW ═══ */}
          {view === "report" && (
            <>
              <div className="mb-4 no-print">
                <select value={selectedStudentId || ""} onChange={(e) => setSelectedStudentId(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-sand-300 bg-white text-sm font-semibold outline-none">
                  <option value="">— Select Student —</option>
                  {classResults.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.last_name} {s.first_name} {showPosition ? `(${getOrdinal(s.position)})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent ? (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden" style={{ fontSize: "13px" }}>

                  {/* Report Header */}
                  <div style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
                    className="text-white text-center px-4 py-4">
                    {logoUrl && (
                      <div className="flex justify-center mb-2">
                        <img src={logoUrl} alt="School logo"
                          style={{ width: 50, height: 50, objectFit: "contain", borderRadius: 8, background: "rgba(255,255,255,0.15)", padding: 4 }} />
                      </div>
                    )}
                    <div className="text-base font-extrabold">{school?.name}</div>
                    {school?.address && <div className="text-[9px] text-white/60 mt-0.5">{school.address}</div>}
                    {school?.motto && <div className="text-[9px] text-white/50 italic">{school.motto}</div>}
                    <div className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold mt-2"
                      style={{ background: "rgba(255,255,255,0.15)" }}>
                      REPORT CARD — {activeSession?.name} {activeTerm?.name}
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="px-4 py-3 border-b border-sand-200">
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
                      <div>
                        <span className="text-[9px] text-gray-400 font-semibold uppercase">Name: </span>
                        <span className="text-[11px] font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-semibold uppercase">Class: </span>
                        <span className="text-[11px] font-bold">{className}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-semibold uppercase">Gender: </span>
                        <span className="text-[11px] font-bold">{selectedStudent.gender === "M" ? "Male" : "Female"}</span>
                      </div>
                      {showPosition && (
                        <div>
                          <span className="text-[9px] text-gray-400 font-semibold uppercase">Position: </span>
                          <span className="text-[11px] font-bold">{getOrdinal(selectedStudent.position)} of {students.length}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] text-gray-400 font-semibold uppercase">No. in Class: </span>
                        <span className="text-[11px] font-bold">{students.length}</span>
                      </div>
                      {daysOpened > 0 && (
                        <>
                          <div>
                            <span className="text-[9px] text-gray-400 font-semibold uppercase">Days Opened: </span>
                            <span className="text-[11px] font-bold">{daysOpened}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 font-semibold uppercase">Days Present: </span>
                            <span className="text-[11px] font-bold">{attendance[selectedStudent.id] ?? "—"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-400 font-semibold uppercase">Attendance: </span>
                            <span className="text-[11px] font-bold">
                              {attendance[selectedStudent.id] !== undefined && daysOpened > 0
                                ? `${Math.round((attendance[selectedStudent.id] / daysOpened) * 100)}%`
                                : "—"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Subject Scores */}
                  <div className="px-4">
                    <div className="grid grid-cols-[1.4fr_repeat(5,1fr)] py-2 text-[9px] font-bold text-gray-400 uppercase tracking-wide border-b-2 border-sand-200">
                      <div>Subject</div>
                      <div className="text-center">CA1<br /><span className="font-normal">({test1Max})</span></div>
                      <div className="text-center">CA2<br /><span className="font-normal">({test2Max})</span></div>
                      <div className="text-center">Exam<br /><span className="font-normal">({examMax})</span></div>
                      <div className="text-center">Total</div>
                      <div className="text-center">Grade</div>
                    </div>

                    {selectedStudent.subjectResults.map((sr, idx) => (
                      <div key={sr.subject}
                        className={`grid grid-cols-[1.4fr_repeat(5,1fr)] py-1.5 border-b border-sand-100 text-[11px] ${idx % 2 ? "bg-sand-50" : ""}`}>
                        <div className="font-semibold">{sr.subject}</div>
                        <div className="text-center text-gray-500">{sr.test1 ?? "—"}</div>
                        <div className="text-center text-gray-500">{sr.test2 ?? "—"}</div>
                        <div className="text-center text-gray-500">{sr.exam ?? "—"}</div>
                        <div className="text-center font-extrabold" style={{ color: theme.primary }}>{sr.total ?? "—"}</div>
                        <div className="text-center font-bold"
                          style={sr.grade === "A" ? { color: theme.primary } : sr.grade === "F" ? { color: "#C62828" } : { color: "#666" }}>
                          {sr.grade ?? "—"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mx-4 mt-3 p-3 rounded-lg" style={{ background: theme.lightest }}>
                    <div className="grid grid-cols-3 text-center">
                      <div>
                        <div className="text-lg font-extrabold" style={{ color: theme.primary }}>{selectedStudent.grandTotal}</div>
                        <div className="text-[9px] font-semibold text-gray-400">TOTAL</div>
                      </div>
                      <div>
                        <div className="text-lg font-extrabold" style={{ color: theme.secondary }}>{selectedStudent.average}%</div>
                        <div className="text-[9px] font-semibold text-gray-400">AVERAGE</div>
                      </div>
                      {showPosition ? (
                        <div>
                          <div className="text-lg font-extrabold" style={{ color: theme.accent }}>{getOrdinal(selectedStudent.position)}</div>
                          <div className="text-[9px] font-semibold text-gray-400">POSITION</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-lg font-extrabold" style={{ color: theme.accent }}>{students.length}</div>
                          <div className="text-[9px] font-semibold text-gray-400">CLASS SIZE</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teacher's Remark */}
                  <div className="mx-4 mt-3 p-3 bg-sand-50 rounded-lg border border-sand-200">
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Teacher&apos;s Remark</div>
                    <div className="text-[11px] font-medium text-gray-700 italic mt-1">
                      &ldquo;{getTeacherRemark(selectedStudent.average)}&rdquo;
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-sand-300">
                      <div>
                        <div className="text-[9px] text-gray-400">Signature</div>
                        <div className="w-28 border-b border-gray-300 mt-3"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-gray-400">Date</div>
                        <div className="w-20 border-b border-gray-300 mt-3"></div>
                      </div>
                    </div>
                  </div>

                  {/* Head Teacher's Remark */}
                  <div className="mx-4 mt-2 p-3 bg-sand-50 rounded-lg border border-sand-200">
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Head Teacher&apos;s Remark</div>
                    <div className="text-[11px] font-medium text-gray-700 italic mt-1">
                      &ldquo;{getHeadTeacherRemark(selectedStudent.average)}&rdquo;
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-sand-300">
                      <div>
                        <div className="text-[9px] text-gray-400">Signature</div>
                        <div className="w-28 border-b border-gray-300 mt-3"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-gray-400">Date</div>
                        <div className="w-20 border-b border-gray-300 mt-3"></div>
                      </div>
                    </div>
                  </div>

                  {/* Fees Warning */}
                  {showFees && !selectedStudent.fees_paid && (
                    <div className="mx-4 mt-2 p-2 bg-amber-50 border border-amber-300 rounded-lg text-[10px] font-semibold text-amber-700 text-center">
                      ⚠️ RESULT WITHHELD — Outstanding fees must be cleared
                    </div>
                  )}

                  {/* Grade Key */}
                  <div className="px-4 py-3 border-t border-sand-200 mt-3">
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { g: "A", r: "70-100" }, { g: "B", r: "60-69" },
                        { g: "C", r: "50-59" }, { g: "D", r: "40-49" }, { g: "F", r: "0-39" },
                      ].map(item => (
                        <span key={item.g} className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: theme.lightest, color: theme.primary }}>
                          {item.g}: {item.r}%
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Print Button */}
                  <div className="p-4 no-print">
                    <button onClick={() => window.print()}
                      className="w-full py-3 text-white rounded-xl font-bold text-sm hover:opacity-90"
                      style={{ background: theme.primary }}>
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
        <div className="px-4 py-12 text-center text-gray-400 text-sm">No scores found. Enter scores first.</div>
      )}
      {!selectedClassId && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">Select a class to view results.</div>
      )}
    </div>
  );
}