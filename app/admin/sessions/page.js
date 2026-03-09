"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";

export default function SessionsPage() {
  const router = useRouter();
  const { theme, user } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [newSession, setNewSession] = useState("");
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: userData } = await supabase
        .from("users")
        .select("school_id, role")
        .eq("id", session.user.id)
        .single();

      if (!userData || userData.role !== "admin") { router.push("/dashboard"); return; }
      setSchoolId(userData.school_id);
      await loadData(userData.school_id);
      setLoading(false);
    };
    init();
  }, []);

  const loadData = async (sId) => {
    const { data: sessionData } = await supabase
      .from("sessions")
      .select("*")
      .eq("school_id", sId)
      .order("created_at", { ascending: false });
    setSessions(sessionData || []);

    if (sessionData?.length) {
      const sessionIds = sessionData.map((s) => s.id);
      const { data: termData } = await supabase
        .from("terms")
        .select("*")
        .in("session_id", sessionIds)
        .order("created_at");
      setTerms(termData || []);
    }
  };

  const addSession = async () => {
    if (!newSession.trim()) return;

    await supabase
      .from("sessions")
      .update({ is_active: false })
      .eq("school_id", schoolId);

    const { data: newSess, error } = await supabase
      .from("sessions")
      .insert({ school_id: schoolId, name: newSession.trim(), is_active: true })
      .select()
      .single();

    if (error) { alert("Error creating session."); return; }

    const termNames = ["1st Term", "2nd Term", "3rd Term"];
    for (let i = 0; i < termNames.length; i++) {
      await supabase.from("terms").insert({
        session_id: newSess.id,
        name: termNames[i],
        is_active: i === 0,
        days_opened: 0,
      });
    }

    setNewSession("");
    await loadData(schoolId);
  };

  const setActiveSession = async (sessionId) => {
    await supabase.from("sessions").update({ is_active: false }).eq("school_id", schoolId);
    await supabase.from("sessions").update({ is_active: true }).eq("id", sessionId);

    const sessionTerms = terms.filter((t) => t.session_id === sessionId);
    for (const t of terms) {
      await supabase.from("terms").update({ is_active: false }).eq("id", t.id);
    }
    if (sessionTerms.length > 0) {
      await supabase.from("terms").update({ is_active: true }).eq("id", sessionTerms[0].id);
    }

    await loadData(schoolId);
  };

  const setActiveTerm = async (termId, sessionId) => {
    const sessionTerms = terms.filter((t) => t.session_id === sessionId);
    for (const t of sessionTerms) {
      await supabase.from("terms").update({ is_active: false }).eq("id", t.id);
    }
    await supabase.from("terms").update({ is_active: true }).eq("id", termId);
    await loadData(schoolId);
  };

  const updateDaysOpened = async (termId, days) => {
    const num = Math.max(0, parseInt(days) || 0);
    await supabase.from("terms").update({ days_opened: num }).eq("id", termId);
    setTerms((prev) => prev.map((t) => t.id === termId ? { ...t, days_opened: num } : t));
  };

  const deleteSession = async (sessionId, sessionName) => {
    if (!confirm(`Delete "${sessionName}" and all its terms? This cannot be undone.`)) return;

    const sessionTerms = terms.filter((t) => t.session_id === sessionId);
    for (const t of sessionTerms) {
      await supabase.from("terms").delete().eq("id", t.id);
    }
    await supabase.from("sessions").delete().eq("id", sessionId);
    await loadData(schoolId);
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
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">Sessions & Terms</h1>
            <p className="text-xs text-white/60">Manage academic sessions</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Add New Session</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSession}
              onChange={(e) => setNewSession(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSession()}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none transition-colors"
              onFocus={(e) => e.target.style.borderColor = theme.secondary}
              onBlur={(e) => e.target.style.borderColor = "#E8E4DD"}
              placeholder="e.g. 2025/2026"
            />
            <button
              onClick={addSession}
              className="px-5 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: theme.primary }}
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sessions.map((session) => {
            const sessionTerms = terms.filter((t) => t.session_id === session.id);
            return (
              <div key={session.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between" style={{ borderLeft: session.is_active ? `4px solid ${theme.primary}` : "4px solid transparent" }}>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{session.name}</div>
                    {session.is_active && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: theme.light, color: theme.primary }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!session.is_active && (
                      <button
                        onClick={() => setActiveSession(session.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg hover:opacity-80"
                        style={{ background: theme.lightest, color: theme.primary }}
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => deleteSession(session.id, session.name)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="border-t border-sand-200 px-4 py-3 space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Terms</div>
                  {sessionTerms.map((term) => (
                    <div key={term.id} className="flex items-center gap-3 py-2 border-b border-sand-100 last:border-0">
                      <button
                        onClick={() => setActiveTerm(term.id, session.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          term.is_active ? "text-white" : "text-gray-500 bg-sand-100"
                        }`}
                        style={term.is_active ? { background: theme.primary } : {}}
                      >
                        {term.name}
                      </button>
                      {term.is_active && (
                        <span className="text-[10px] font-bold" style={{ color: theme.accent }}>● Active</span>
                      )}
                      <div className="flex-1" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-semibold">Days:</span>
                        <input
                          type="number"
                          value={term.days_opened || 0}
                          onChange={(e) => updateDaysOpened(term.id, e.target.value)}
                          className="w-14 px-2 py-1 text-center text-xs font-semibold border-2 border-sand-300 rounded-lg bg-sand-50 focus:outline-none"
                          onFocus={(e) => e.target.style.borderColor = theme.secondary}
                          onBlur={(e) => e.target.style.borderColor = "#E8E4DD"}
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No sessions yet. Add your first session above (e.g. "2025/2026").
          </div>
        )}
      </div>
    </div>
  );
}