"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { THEMES } from "@/lib/themes";

export default function SchoolSettingsPage() {
  const router = useRouter();
  const { theme, themeId, school, updateTheme, refreshSchool } = useTheme();
  const [form, setForm] = useState({ name: "", address: "", motto: "", show_position: true, show_fees: true, test1_max: 20, test2_max: 20, exam_max: 60 });
  const [selectedTheme, setSelectedTheme] = useState(themeId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (school) {
      setForm({
        name: school.name || "",
        address: school.address || "",
        motto: school.motto || "",
        show_position: school.show_position !== false,
        show_fees: school.show_fees !== false,
        test1_max: school.test1_max || 20,
        test2_max: school.test2_max || 20,
        exam_max: school.exam_max || 60,
      });
      setSelectedTheme(school.theme || "royal");
      setLogoUrl(school.logo_url || null);
      setLoading(false);
    }
  }, [school]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Logo must be under 2MB."); return; }
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${school.id}-logo.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("logos").upload(fileName, file, { upsert: true });
    if (uploadError) { alert("Error uploading logo."); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl + "?t=" + Date.now();
    await supabase.from("schools").update({ logo_url: publicUrl }).eq("id", school.id);
    setLogoUrl(publicUrl);
    await refreshSchool();
    setUploading(false);
  };

  const removeLogo = async () => {
    if (!confirm("Remove school logo?")) return;
    await supabase.from("schools").update({ logo_url: null }).eq("id", school.id);
    setLogoUrl(null);
    await refreshSchool();
  };

  const totalMax = (form.test1_max || 0) + (form.test2_max || 0) + (form.exam_max || 0);

  const handleSave = async () => {
    if (!school) return;
    if (totalMax !== 100) { alert("Score structure must add up to 100. Currently: " + totalMax); return; }
    setSaving(true);
    const { error } = await supabase.from("schools").update({
      name: form.name, address: form.address, motto: form.motto,
      theme: selectedTheme, show_position: form.show_position, show_fees: form.show_fees,
      test1_max: form.test1_max, test2_max: form.test2_max, exam_max: form.exam_max,
    }).eq("id", school.id);
    if (error) { alert("Error saving."); }
    else { await updateTheme(selectedTheme); await refreshSchool(); setSaved(true); setTimeout(() => setSaved(false), 2000); }
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
            <p className="text-xs text-white/60">Details, logo, theme, score structure & settings</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* School Logo */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">School Logo</div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-sand-300 flex items-center justify-center overflow-hidden"
              style={{ background: logoUrl ? "white" : "#F7F5F0" }}>
              {logoUrl ? <img src={logoUrl} alt="School logo" className="w-full h-full object-contain" /> : <span className="text-2xl">🏫</span>}
            </div>
            <div className="flex-1">
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="px-4 py-2 text-sm font-bold rounded-xl transition-all text-white disabled:opacity-50"
                style={{ background: previewTheme.primary }}>
                {uploading ? "Uploading..." : logoUrl ? "Change Logo" : "Upload Logo"}
              </button>
              {logoUrl && <button onClick={removeLogo} className="ml-2 px-4 py-2 text-sm font-bold rounded-xl bg-red-50 text-red-600 hover:bg-red-100">Remove</button>}
              <div className="text-[10px] text-gray-400 mt-2">PNG or JPG, max 2MB. Shows on report cards.</div>
            </div>
          </div>
        </div>

        {/* School Details */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">School Details</div>
          {[
            { label: "School Name", key: "name", placeholder: "e.g. Ifelyn Smart Kids Academy" },
            { label: "Address", key: "address", placeholder: "e.g. Asaba, Delta State" },
            { label: "Motto", key: "motto", placeholder: "e.g. Desire, Focus, Keep Learning & Excel" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">{f.label}</label>
              <input type="text" value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-sand-300 bg-sand-50 text-sm font-medium focus:outline-none transition-colors"
                onFocus={(e) => e.target.style.borderColor = previewTheme.secondary}
                onBlur={(e) => e.target.style.borderColor = "#E8E4DD"}
                placeholder={f.placeholder} />
            </div>
          ))}
        </div>

        {/* Score Structure */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Score Structure</div>
          <div className="text-[10px] text-gray-400 mb-4">Set the maximum marks for each component. Must add up to 100.</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "1st Test", key: "test1_max" },
              { label: "2nd Test", key: "test2_max" },
              { label: "Exam", key: "exam_max" },
            ].map(f => (
              <div key={f.key} className="text-center">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">{f.label}</label>
                <input type="number" value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-3 rounded-xl border-2 border-sand-300 bg-sand-50 text-center text-lg font-bold focus:outline-none transition-colors"
                  onFocus={(e) => e.target.style.borderColor = previewTheme.secondary}
                  onBlur={(e) => e.target.style.borderColor = "#E8E4DD"}
                  min="0" max="100" />
              </div>
            ))}
          </div>
          <div className={`text-center mt-3 text-sm font-bold ${totalMax === 100 ? "text-green-600" : "text-red-600"}`}>
            Total: {totalMax} / 100 {totalMax === 100 ? "✓" : "— must equal 100"}
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              { label: "15-15-70", t1: 15, t2: 15, ex: 70 },
              { label: "20-20-60", t1: 20, t2: 20, ex: 60 },
              { label: "10-10-80", t1: 10, t2: 10, ex: 80 },
              { label: "10-20-70", t1: 10, t2: 20, ex: 70 },
            ].map(p => (
              <button key={p.label}
                onClick={() => setForm({ ...form, test1_max: p.t1, test2_max: p.t2, exam_max: p.ex })}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={{
                  background: form.test1_max === p.t1 && form.test2_max === p.t2 && form.exam_max === p.ex ? previewTheme.primary : previewTheme.lightest,
                  color: form.test1_max === p.t1 && form.test2_max === p.t2 && form.exam_max === p.ex ? "white" : previewTheme.primary,
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Card Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">Report Card Settings</div>

          {[
            { key: "show_position", label: "Show Position on Report Card", desc: "Display student's class ranking" },
            { key: "show_fees", label: "Show Fee Status on Report Card", desc: "Display paid/owing status and withholding notice" },
          ].map(toggle => (
            <div key={toggle.key} className="flex items-center justify-between py-3 border-b border-sand-200 last:border-0">
              <div>
                <div className="text-sm font-semibold text-gray-800">{toggle.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{toggle.desc}</div>
              </div>
              <button
                onClick={() => setForm({ ...form, [toggle.key]: !form[toggle.key] })}
                className="w-12 h-7 rounded-full transition-colors"
                style={{ background: form[toggle.key] ? previewTheme.primary : "#D4CFC5" }}>
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${form[toggle.key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
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
              <div className="flex items-center gap-2">
                {logoUrl && <img src={logoUrl} alt="" style={{ width: 24, height: 24, objectFit: "contain", borderRadius: 4 }} />}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{form.name || "School Name"}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{form.address || "School Address"}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "10px 12px", background: "#F7F5F0" }}>
              <div className="flex gap-2">
                <div style={{ flex: 1, padding: "8px", borderRadius: 8, background: previewTheme.primary, color: "white", fontSize: 10, fontWeight: 700, textAlign: "center" }}>✏️ Scores</div>
                <div style={{ flex: 1, padding: "8px", borderRadius: 8, background: "white", color: previewTheme.primary, fontSize: 10, fontWeight: 700, textAlign: "center", border: `1px solid ${previewTheme.light}` }}>📊 Results</div>
              </div>
              <div className="text-[9px] text-gray-400 mt-2 text-center">
                Score structure: {form.test1_max}-{form.test2_max}-{form.exam_max}
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || totalMax !== 100}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
          style={{ background: saved ? previewTheme.accent : previewTheme.primary }}>
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}