"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";

export default function AttendancePage() {
  const router = useRouter();
  const { theme, user } = useTheme();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [activeTerm, setActiveTerm] = useState(null);
  const [daysOpened, setDaysOpened] = useState(0);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: userData } = await supabase
        .from("users")
        .select("school_id, role")
        .eq("id", session.user.id)
        .single();

      if (!userData) { router.push("/login"); return; }

      const { data: sessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("school_id", userData.school_id)
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
        setDaysOpened(term?.days_opened || 0);
      }

      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", userData.school_id)
        .order("sort_order");
      setClasses(classData || []);

      setLoading(false);
    };
    init();
  }, []);

  const loadStudents = async (classId) => {
    setSelectedClassId(classId);
    if (!classId || !activeTerm) { setStudents([]); setAttendance({}); return; }

    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId)
      .eq("is_active", true)
      .order("last_name");
    setStudents(studentData || []);

    if (studentData?.length) {
      const studentIds = studentData.map((s) => s.id);
      const { data: attData } = await supabase
        .from("attendance")
        .select("*")
        .in("student_id", studentIds)
        .eq("term_id", activeTerm.id);

      const attMap = {};
      (attData || []).forEach((a) => {
        attMap[a.student_id] = a.days_present;
      });
      setAttendance(attMap);
    }
  };

  const updateAttendance = (studentId, value) => {
    const num = value === "" ? "" : Math.min(Math.max(0, parseInt(value) || 0), daysOpened || 999);
    setAttendance((prev) => ({ ...prev, [studentId]: num }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!activeTerm) return;
    setSaving(true);

    const upsertData = students
      .filter((s) => attendance[s.id] !== undefined && attendance[s.id] !== "")
      .map((s) => ({
        student_id: s.id,
        term_id: activeTerm.id,
        days_present: attendance[s.id] === "" ? 0 : attendance[s.id],
      }));

    if (upsertData.length > 0) {
      const { error } = await supabase
        .from("attendance")
        .upsert(upsertData, { onConflict: "student_id,term_id" });

      if (error) {
        alert("Error saving attendance.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${theme.primary} transparent ${theme.primary} ${theme.primary}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-100">
      <div style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
        className="text-white px-5 pt-4 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">Attendance</h1>
            <p className="text-xs text-white/60">{activeTerm?.name || "No active term"} — {daysOpened} days opened</p>
          </div>
        </div>

        <select value={selectedClassId} onChange={(e) => loadStudents(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold border-0 outline-none">
          <option value="" className="text-gray-800">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id} className="text-gray-800">{cls.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId && students.length > 0 && (
        <div className="px-4 py-4">
          {daysOpened === 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4 text-xs font-semibold text-amber-700">
              ⚠️ Days opened is 0. Go to Admin → Sessions to set the number of days school opened this term.
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] px-3 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide"
              style={{ background: theme.lightest }}>
              <div>Student</div>
              <div className="text-center">Days Present</div>
              <div className="text-center">Out of {daysOpened}</div>
            </div>

            {students.map((student, idx) => {
              const present = attendance[student.id] ?? "";
              const pct = present !== "" && daysOpened > 0 ? Math.round((present / daysOpened) * 100) : null;
              return (
                <div key={student.id}
                  className={`grid grid-cols-[1.5fr_1fr_1fr] px-3 py-2.5 items-center border-b border-sand-200 ${
                    idx % 2 === 0 ? "bg-white" : "bg-sand-50"
                  }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: theme.light, color: theme.primary }}>
                      {student.first_name[0]}{student.last_name[0]}
                    </div>
                    <div className="text-xs font-semibold">{student.last_name} {student.first_name}</div>
                  </div>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      min="0"
                      max={daysOpened || 999}
                      value={present}
                      onChange={(e) => updateAttendance(student.id, e.target.value)}
                      placeholder="—"
                      className="w-14 py-1.5 text-center text-sm font-semibold bg-sand-50 border-2 border-sand-300 rounded-lg outline-none transition-colors"
                      onFocus={(e) => e.target.style.borderColor = theme.secondary}
                      onBlur={(e) => e.target.style.borderColor = "#E8E4DD"}
                    />
                  </div>
                  <div className="text-center text-xs font-semibold" style={{ color: pct !== null && pct < 75 ? "#C62828" : theme.primary }}>
                    {pct !== null ? `${pct}%` : "—"}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full mt-4 py-3.5 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-50"
            style={{ background: saved ? theme.accent : theme.primary }}>
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Attendance"}
          </button>
        </div>
      )}

      {selectedClassId && students.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">No students in this class.</div>
      )}

      {!selectedClassId && (
        <div className="px-4 py-12 text-center text-gray-400 text-sm">Select a class to enter attendance.</div>
      )}
    </div>
  );
}