"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getTheme } from "@/lib/themes";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getTheme("royal"));
  const [themeId, setThemeId] = useState("royal");
  const [school, setSchool] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndSchool();
  }, []);

  const loadUserAndSchool = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("*, schools(*)")
      .eq("id", session.user.id)
      .single();

    if (userData) {
      setUser(userData);
      setSchool(userData.schools);
      const t = userData.schools?.theme || "royal";
      setThemeId(t);
      setTheme(getTheme(t));
    }
    setLoading(false);
  };

  const updateTheme = async (newThemeId) => {
    setThemeId(newThemeId);
    setTheme(getTheme(newThemeId));

    if (school) {
      await supabase
        .from("schools")
        .update({ theme: newThemeId })
        .eq("id", school.id);
    }
  };

  const refreshSchool = async () => {
    if (user) {
      const { data } = await supabase
        .from("schools")
        .select("*")
        .eq("id", user.school_id)
        .single();
      if (data) {
        setSchool(data);
        const t = data.theme || "royal";
        setThemeId(t);
        setTheme(getTheme(t));
      }
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      themeId,
      school,
      user,
      loading,
      updateTheme,
      refreshSchool,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}