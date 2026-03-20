"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";

export default function DashboardPage() {
  const router = useRouter();
  const { theme, school, user, loading: themeLoading } = useTheme();
  const [classes, setClasses] = useState([]);
  const [activeTerm, setActiveTerm] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [studentCounts, setStudentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (themeLoading) return;

    // If ThemeContext finished but no user, check if we have a session
    if (!user) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.push("/login");
        }
        // If session exists but user not in ThemeContext, just show loading
        // Don't redirect or reload — the data might still be loading
        setAuthChecked(true);
      });
      return;
    }

    setAuthChecked(true);
    loadData();
  }, [themeLoading, user]);

  const loadData = async () => {
    if (!user) { setLoading(false); return; }

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
    window.location.href = "/login";
  };

  // Show loading while checking auth or loading data
  if (themeLoading || (!authChecked) || (user && loading)) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${theme.primary} transparent ${theme.primary} ${theme.primary}` }} />
      </div>
    );
  }

  // If auth checked and still no user, show message
  if (!user) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-4">Unable to load your account. Please log in again.</div>
          <button onClick={() => window.location.href = "/login"}
            className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold text-sm">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-100">
      <div style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)` }}
        className="text-white px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg overflow-hidden"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              {school?.logo_url ? (
                <img src={school.logo_url} alt="" className="w-full h-full object-contain" />
              ) : (
                <span>📚</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold">{school?.name || "School"}</h1>
              <p className="text-xs text-white/70">{school?.address}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white/90">Logout</button>
        </div>

        <div className="flex gap-3 mt-3">
          <div className="rounded-xl px-4 py-2.5 flex-1" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="text-[10px] text-white/50 uppercase tracking-wide font-semibold">Session</div>
            <div className="text-sm font-bold mt-0.5">{activeSession?.name || "Not set"}</div>
          </div>
          <div className="rounded-xl px-4 py-2.5 flex-1" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="text-[10px] text-white/50 uppercase tracking-wide font-semibold">Term</div>
            <div className="text-sm font-bold mt-0.5">{activeTerm?.name || "Not set"}</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => router.push("/scores")}
            style={{ background: theme.primary }}
            className="text-white rounded-2xl p-4 text-left hover:opacity-90 transition-opacity">
            <span className="text-2xl">✏️</span>
            <div className="text-sm font-bold mt-2">Enter Scores</div>
            <div className="text-[10px] text-white/60 mt-0.5">Input CA & exam scores</div>
          </button>
          <button onClick={() => router.push("/results")}
            className="bg-white rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl">📊</span>
            <div className="text-sm font-bold mt-2" style={{ color: theme.primary }}>View Results</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Rankings & report cards</div>
          </button>
        </div>

        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Classes</h2>
        <div className="space-y-3 mb-6">
          {classes.map((cls) => (
            <div key={cls.id}
              onClick={() => router.push(`/scores?class=${cls.id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: theme.light, color: theme.primary }}>
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
            <div className="text-center py-6 text-gray-400 text-sm">
              No classes yet. Go to Admin → Classes to add them.
            </div>
          )}
        </div>

        {user?.role === "admin" && (
          <>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Admin</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/admin/school", icon: "🏫", label: "School Info", desc: "Name, theme, settings" },
                { href: "/admin/sessions", icon: "📅", label: "Sessions", desc: "Sessions & terms" },
                { href: "/admin/classes", icon: "📋", label: "Classes", desc: "Add & manage classes" },
                { href: "/admin/subjects", icon: "📖", label: "Subjects", desc: "Assign subjects to classes" },
                { href: "/admin/students", icon: "👨‍🎓", label: "Students", desc: "Register & manage" },
                { href: "/admin/attendance", icon: "📝", label: "Attendance", desc: "Days present per student" },
              ].map((item) => (
                <button key={item.href} onClick={() => router.push(item.href)}
                  className="bg-white rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xl">{item.icon}</span>
                  <div className="text-xs font-bold mt-2 text-gray-800">{item.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}