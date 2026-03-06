"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [school, setSchool] = useState(null);
  const [classes, setClasses] = useState([]);
  const [activeTerm, setActiveTerm] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [studentCounts, setStudentCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    // Get user's school
    const { data: user } = await supabase
      .from("users")
      .select("*, schools(*)")
      .eq("id", session.user.id)
      .single();

    if (!user) {
      router.push("/login");
      return;
    }

    setSchool(user.schools);

    // Get active session
    const { data: sessions } = await supabase
      .from("sessions")
      .select("*")
      .eq("school_id", user.school_id)
      .eq("is_active", true)
      .single();

    setActiveSession(sessions);

    // Get active term
    if (sessions) {
      const { data: term } = await supabase
        .from("terms")
        .select("*")
        .eq("session_id", sessions.id)
        .eq("is_active", true)
        .single();
      setActiveTerm(term);
    }

    // Get classes
    const { data: classData } = await supabase
      .from("classes")
      .select("*")
      .eq("school_id", user.school_id)
      .order("sort_order");

    setClasses(classData || []);

    // Count students per class
    if (classData) {
      const counts = {};
      for (const cls of classData) {
        const { count } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("class_id", cls.id)
          .eq("is_active", true);
        counts[cls.id] = count || 0;
      }
      setStudentCounts(counts);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
      {/* Header */}
      <div className="bg-gradient-to-br from-forest-800 to-forest-700 text-white px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-lg">📚</div>
            <div>
              <h1 className="text-lg font-bold">{school?.name || "School"}</h1>
              <p className="text-xs text-white/70">{school?.address}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white/90">
            Logout
          </button>
        </div>

        {/* Session / Term Info */}
        <div className="flex gap-3 mt-3">
          <div className="bg-white/10 rounded-xl px-4 py-2.5 flex-1">
            <div className="text-[10px] text-white/50 uppercase tracking-wide font-semibold">Session</div>
            <div className="text-sm font-bold mt-0.5">{activeSession?.name || "Not set"}</div>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2.5 flex-1">
            <div className="text-[10px] text-white/50 uppercase tracking-wide font-semibold">Term</div>
            <div className="text-sm font-bold mt-0.5">{activeTerm?.name || "Not set"}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => router.push("/scores")}
            className="bg-forest-800 text-white rounded-2xl p-4 text-left hover:bg-forest-700 transition-colors"
          >
            <span className="text-2xl">✏️</span>
            <div className="text-sm font-bold mt-2">Enter Scores</div>
            <div className="text-[10px] text-white/60 mt-0.5">Input CA & exam scores</div>
          </button>
          <button
            onClick={() => router.push("/results")}
            className="bg-white rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">📊</span>
            <div className="text-sm font-bold mt-2 text-forest-800">View Results</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Rankings & report cards</div>
          </button>
        </div>

        {/* Classes */}
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Classes</h2>
        <div className="space-y-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => router.push(`/scores?class=${cls.id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-forest-100 rounded-xl flex items-center justify-center text-forest-800 font-bold text-sm">
                  {cls.name.replace("Primary ", "P")}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">{cls.name}</div>
                  <div className="text-xs text-gray-400">{studentCounts[cls.id] || 0} students</div>
                </div>
              </div>
              <div className="text-gray-300 text-lg">→</div>
            </div>
          ))}

          {classes.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No classes yet. Add classes in Supabase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
