"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { THEMES } from "@/lib/themes";

export default function SchoolSettingsPage() {
  const router = useRouter();
  const { theme, themeId, school, updateTheme, refreshSchool } = useTheme();
  const [form, setForm] = useState({ name: "", address: "", motto: "", show_position: true });
  const [selectedTheme, setSelectedTheme] = useState(themeId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (school) {
      setForm({
        name: school.name || "",
        address: school.address || "",
        motto: school.motto || "",
        show_position: school.show_position !== false,
      });
      setSelectedTheme(school.theme || "royal");
      setLoading(false);
    }
  }, [school]);

  const handleSave = async () => {
    if (!school) return;
    setSaving(true);

    const { error } = await supabase
      .from("schools")
      .update({
        name: form.name,
        address: form.address,
        motto: form.motto,
        theme: selectedTheme,
        show_position: form.show_position,
      })
      .eq("id", school.id);

    if (error) {
      alert("Error saving. Please try again.");
    } else {
      await updateTheme(selectedTheme);
      await refreshSchool();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const previewTheme = THEMES[selectedTheme] || THEMES.royal;

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
      <div style={{ background: `linear-gradient(135deg, ${previewTheme.primary} 0%, ${previewTheme.secondary} 100%)` }}
        className="text-white px-5 pt-4 pb-5 transition-all duration-300">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-white/60 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-lg font-bold">School Info</h1>
            <p className="text-xs text-white/60">Edit details, theme & settings</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* School Details */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">School Details</div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">School Name</label>
            <input type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none transition-colors"
              onFocus={(e) => e.target.style.borderColor = previewTheme.secondary}
              onBlur={(e) => e.target.style.borderColor = "#E8E4DD"}
              placeholder="e.g. Evelyn Primary School" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Address</label>
            <input type="text" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none transition-colors"
              onFocus={(e) => e.target.style.borderColor = previewTheme.secondary}
              onBlur={(e) => e.target.style.borderColor = "#E8E4DD"}
              placeholder="e.g. 5 Okpanam Road, Asaba" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Motto</label>
            <input type="text" value={form.motto}
              onChange={(e) => setForm({ ...form, motto: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none transition-colors"
              onFocus={(e) => e.target.style.borderColor = previewTheme.secondary}
              onBlur={(e) => e.target.style.borderColor = "#E8E4DD"}
              placeholder="e.g. Knowledge is Power" />
          </div>
        </div>

        {/* Report Card Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">Report Card Settings</div>
          <div className="flex items-center justify-between py-3 border-b border-sand-200">
            <div>
              <div className="text-sm font-semibold text-gray-800">Show Position on Report Card</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Display student's class ranking on their report card</div>
            </div>
            <button
              onClick={() => setForm({ ...form, show_position: !form.show_position })}
              className="w-12 h-7 rounded-full transition-colors"
              style={{ background: form.show_position ? previewTheme.primary : "#D4CFC5" }}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${form.show_position ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">School Color Theme</div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(THEMES).map(([id, t]) => (
              <button key={id} onClick={() => setSelectedTheme(id)}
                className="rounded-xl p-3 text-center transition-all"
                style={{
                  border: selectedTheme === id ? `3px solid ${t.primary}` : "3px solid #E8E4DD",
                  background: selectedTheme === id ? t.lightest : "white",
                }}>
                <div className="flex justify-center gap-1 mb-2">
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: t.primary }} />
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: t.secondary }} />
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: t.accent }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: selectedTheme === id ? t.primary : "#888" }}>{t.name}</div>
              </button>
            ))}
          </div>

          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Preview</div>
          <div className="rounded-xl overflow-hidden border border-sand-300">
            <div style={{ background: `linear-gradient(135deg, ${previewTheme.primary} 0%, ${previewTheme.secondary} 100%)`, padding: "12px 16px", color: "white" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{form.name || "School Name"}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{form.address || "School Address"}</div>
            </div>
            <div style={{ padding: "10px 12px", background: "#F7F5F0" }}>
              <div className="flex gap-2">
                <div style={{ flex: 1, padding: "8px", borderRadius: 8, background: previewTheme.primary, color: "white", fontSize: 10, fontWeight: 700, textAlign: "center" }}>✏️ Scores</div>
                <div style={{ flex: 1, padding: "8px", borderRadius: 8, background: "white", color: previewTheme.primary, fontSize: 10, fontWeight: 700, textAlign: "center", border: `1px solid ${previewTheme.light}` }}>📊 Results</div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
          style={{ background: saved ? previewTheme.accent : previewTheme.primary }}>
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}