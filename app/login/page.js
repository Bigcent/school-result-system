"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i, x: Math.random() * 100, size: Math.random() * 4 + 2,
  duration: Math.random() * 20 + 10, delay: Math.random() * -20,
  opacity: Math.random() * 0.3 + 0.05,
}));

const BOOKS = [
  { emoji: "📕", x: 8, y: 15, delay: 0, scale: 1.2 },
  { emoji: "📗", x: 85, y: 20, delay: 1.5, scale: 1 },
  { emoji: "📘", x: 12, y: 70, delay: 0.8, scale: 1.4 },
  { emoji: "📙", x: 88, y: 65, delay: 2, scale: 1.1 },
  { emoji: "📓", x: 50, y: 8, delay: 0.5, scale: 0.9 },
  { emoji: "📒", x: 75, y: 85, delay: 1.2, scale: 1.3 },
];

const SCHOOL_ITEMS = [
  { emoji: "✏️", x: 20, y: 35, delay: 0.3 },
  { emoji: "🎓", x: 78, y: 40, delay: 1 },
  { emoji: "📐", x: 30, y: 82, delay: 1.8 },
  { emoji: "🏫", x: 65, y: 12, delay: 0.6 },
  { emoji: "🔬", x: 15, y: 55, delay: 2.2 },
  { emoji: "🎨", x: 82, y: 50, delay: 1.4 },
  { emoji: "⚽", x: 45, y: 90, delay: 0.9 },
  { emoji: "🌍", x: 92, y: 30, delay: 1.7 },
];

const FEATURES = [
  { icon: "⚡", title: "Instant Results", desc: "Enter scores once — totals, rankings, and grades calculate automatically in real time." },
  { icon: "📊", title: "Smart Report Cards", desc: "Professional report cards with auto-generated remarks, attendance, and school branding." },
  { icon: "🎨", title: "Your School, Your Brand", desc: "Custom colors, logo upload, and personalized interface for every school." },
  { icon: "🖨️", title: "Print-Ready", desc: "Report cards and class rankings print beautifully with full color on A4 paper." },
  { icon: "🔒", title: "Secure & Private", desc: "Each school's data is completely isolated. Only your staff can access results." },
  { icon: "📱", title: "Works Everywhere", desc: "Use on phone, tablet, or laptop. No app download needed — just open your browser." },
];

const STEPS = [
  { num: "01", icon: "🏫", title: "Register Your School", desc: "Enter school name, address, motto, and upload your logo. Takes 2 minutes." },
  { num: "02", icon: "📋", title: "Set Up Classes & Subjects", desc: "Add classes and pick subjects from our library of 30+ Nigerian curriculum subjects." },
  { num: "03", icon: "✏️", title: "Enter Scores", desc: "Simple spreadsheet-style grid. Just type CA1, CA2, and Exam scores." },
  { num: "04", icon: "📄", title: "Print Report Cards", desc: "Rankings, remarks, attendance — ready to distribute to parents." },
];

function ScrollReveal({ children, delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const transforms = { up: "translateY(50px)", left: "translateX(-50px)", right: "translateX(50px)", scale: "scale(0.85)" };
  return (
    <div ref={ref} style={{
      transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      transform: visible ? "translateY(0) translateX(0) scale(1)" : transforms[direction],
      opacity: visible ? 1 : 0,
    }}>{children}</div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolMotto, setSchoolMotto] = useState("");
  const [fullName, setFullName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [pops, setPops] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const popId = useRef(0);
  const heroRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const handleHeroClick = (e) => {
    if (!heroRef.current?.contains(e.target)) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const emojis = ["⭐", "✨", "💫", "🌟", "📚", "✏️", "🎓", "💡"];
    const newPops = Array.from({ length: 6 }, (_, i) => ({
      id: popId.current++, x, y,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      angle: (i * 60) + Math.random() * 30,
      distance: 40 + Math.random() * 60,
    }));
    setPops(prev => [...prev, ...newPops]);
    setTimeout(() => setPops(prev => prev.filter(p => !newPops.includes(p))), 1000);
  };

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { window.location.href = "/dashboard"; }
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Logo must be under 2MB."); return; }
    setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); setError("");
  };

  const handleRegister = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!schoolName.trim()) { setError("Please enter your school name."); return; }
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    setLoading(true); setError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) { setError("Registration error: " + authError.message); setLoading(false); return; }
      const userId = authData.user?.id;
      if (!userId) { setError("Registration failed."); setLoading(false); return; }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError("Account created but sign in failed: " + signInError.message); setMode("login"); setLoading(false); return; }
      const { data: schoolData, error: schoolError } = await supabase.from("schools").insert({ name: schoolName.trim(), address: schoolAddress.trim() || null, motto: schoolMotto.trim() || null, theme: "royal" }).select().single();
      if (schoolError || !schoolData) { setError("School creation failed: " + (schoolError?.message || "Unknown")); setLoading(false); return; }
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const fname = `${schoolData.id}-logo.${ext}`;
        const { error: upErr } = await supabase.storage.from("logos").upload(fname, logoFile, { upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fname);
          await supabase.from("schools").update({ logo_url: urlData.publicUrl + "?t=" + Date.now() }).eq("id", schoolData.id);
        }
      }
      const { error: userError } = await supabase.from("users").insert({ id: userId, school_id: schoolData.id, full_name: fullName.trim(), role: "admin" });
      if (userError) { setError("Profile creation failed: " + userError.message); setLoading(false); return; }
      window.location.href = "/dashboard";
    } catch (err) { setError("Something went wrong: " + (err.message || "Unknown")); setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("Enter your email first."); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login" });
    if (error) setError(error.message);
    else setSuccess("Password reset link sent to your email.");
    setLoading(false);
  };

  const nextStep = () => {
    if (step === 1 && !schoolName.trim()) { setError("Please enter your school name."); return; }
    setError(""); setStep(step + 1);
  };

  const iStyle = { width: "100%", padding: "16px 18px", borderRadius: 16, border: "2px solid #e2e8f0", background: "white", fontSize: 15, fontWeight: 600, outline: "none", fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s ease", boxSizing: "border-box" };
  const iFocus = (e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)"; };
  const iBlur = (e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 };
  const btnPrimary = { width: "100%", padding: 18, borderRadius: 18, border: "none", background: "linear-gradient(135deg, #1e3a5f, #2563eb, #7c3aed)", backgroundSize: "200% 200%", color: "white", fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 6px 24px rgba(37,99,235,0.35)", transition: "all 0.3s ease", letterSpacing: 0.5 };

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", color: "#1e293b" }} onClick={handleHeroClick}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes bgShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes bookBounce { 0%,100% { transform: translateY(0) rotate(0deg) scale(1); } 25% { transform: translateY(-30px) rotate(-15deg) scale(1.15); } 50% { transform: translateY(-10px) rotate(5deg) scale(1.05); } 75% { transform: translateY(-25px) rotate(-8deg) scale(1.1); } }
        @keyframes itemFloat { 0%,100% { transform: translateY(0) translateX(0) rotate(0deg); } 20% { transform: translateY(-18px) translateX(8px) rotate(10deg); } 40% { transform: translateY(-8px) translateX(-5px) rotate(-5deg); } 60% { transform: translateY(-22px) translateX(3px) rotate(8deg); } 80% { transform: translateY(-5px) translateX(-8px) rotate(-3deg); } }
        @keyframes particle { 0% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100vh) translateX(50px); opacity: 0; } }
        @keyframes popExplode { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx),var(--ty)) scale(0); opacity: 0; } }
        @keyframes slideUp { 0% { transform: translateY(40px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes wave { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-15deg); } }
        @keyframes ringPulse { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.2; } 100% { transform: scale(0.8); opacity: 0.5; } }
        @keyframes gradientOrb { 0%,100% { transform: translate(0,0) scale(1); } 25% { transform: translate(30px,-20px) scale(1.1); } 50% { transform: translate(-10px,20px) scale(0.95); } 75% { transform: translate(20px,10px) scale(1.05); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .feat-card:hover { transform: translateY(-8px) scale(1.02) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; }
        .step-card:hover { transform: scale(1.02) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.06) !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>

      <div ref={heroRef} onMouseMove={handleMouseMove} style={{ minHeight: "100vh", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", cursor: "crosshair" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(270deg, #0a0e27, #0f1b3d, #0c1445, #131852, #0a1a3f, #0d1233)", backgroundSize: "600% 600%", animation: "bgShift 15s ease infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.2), transparent 70%)", top: "10%", left: "10%", animation: "gradientOrb 8s ease-in-out infinite", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)", bottom: "5%", right: "5%", animation: "gradientOrb 10s ease-in-out infinite reverse", filter: "blur(50px)" }} />

        {PARTICLES.map(p => <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, bottom: "-5%", width: p.size, height: p.size, borderRadius: "50%", background: `rgba(${100+Math.random()*155},${100+Math.random()*155},255,${p.opacity})`, animation: `particle ${p.duration}s linear infinite`, animationDelay: `${p.delay}s`, pointerEvents: "none" }} />)}
        {BOOKS.map((b, i) => <div key={i} style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}%`, fontSize: 32 * b.scale, animation: `bookBounce ${4+i*0.5}s ease-in-out infinite`, animationDelay: `${b.delay}s`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))", opacity: loaded ? 1 : 0, transition: `opacity 0.5s ease ${0.3+i*0.15}s`, pointerEvents: "none", zIndex: 1 }}>{b.emoji}</div>)}
        {SCHOOL_ITEMS.map((item, i) => <div key={i} style={{ position: "absolute", left: `${item.x}%`, top: `${item.y}%`, fontSize: 22, animation: `itemFloat ${5+i*0.7}s ease-in-out infinite`, animationDelay: `${item.delay}s`, opacity: loaded ? 0.5 : 0, transition: `opacity 0.5s ease ${0.5+i*0.1}s`, pointerEvents: "none", zIndex: 1 }}>{item.emoji}</div>)}
        {pops.map(pop => { const rad = (pop.angle*Math.PI)/180; return <div key={pop.id} style={{ position: "absolute", left: pop.x, top: pop.y, fontSize: 20, pointerEvents: "none", zIndex: 100, "--tx": `${Math.cos(rad)*pop.distance}px`, "--ty": `${Math.sin(rad)*pop.distance}px`, animation: "popExplode 0.8s ease-out forwards" }}>{pop.emoji}</div>; })}

        <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 10, opacity: loaded ? 1 : 0, animation: loaded ? "slideUp 0.8s ease-out" : "none" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, #2563eb, #7c3aed, #2563eb)", backgroundSize: "200% 200%", animation: "bgShift 4s ease infinite", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36, boxShadow: "0 8px 40px rgba(99,102,241,0.4)", transform: loaded ? "scale(1)" : "scale(0)", transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s" }}><span style={{ animation: "wave 2s ease-in-out infinite" }}>📊</span></div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 900, color: "white", letterSpacing: -1, lineHeight: 1 }}>EasyAcad</h1>
            <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginTop: 10, background: "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.8), rgba(255,255,255,0.3))", backgroundSize: "200% auto", animation: "shimmer 3s linear infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Result Processing Made Effortless</p>
          </div>

          <div style={{ display: "flex", borderRadius: 20, padding: 4, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setStep(1); setError(""); setSuccess(""); }} style={{ flex: 1, padding: "14px 0", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5, transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)", background: mode === m ? "white" : "transparent", color: mode === m ? "#1e293b" : "rgba(255,255,255,0.4)", boxShadow: mode === m ? "0 4px 20px rgba(0,0,0,0.15)" : "none" }}>{m === "login" ? "✨ Sign In" : "🚀 Register School"}</button>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(30px)", borderRadius: 28, padding: 28, boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }}>
            {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, fontWeight: 600, borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: 13, fontWeight: 600, borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>{success}</div>}

            {mode === "login" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={iStyle} onFocus={iFocus} onBlur={iBlur} placeholder="admin@yourschool.com" /></div>
                <div><label style={labelStyle}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={iStyle} onFocus={iFocus} onBlur={iBlur} placeholder="••••••••" /></div>
                <button onClick={handleLogin} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>{loading ? "Signing in..." : "Sign In →"}</button>
                <button onClick={handleForgotPassword} style={{ width: "100%", padding: 8, border: "none", background: "none", color: "#6366f1", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Forgot password?</button>
              </div>
            )}

            {mode === "register" && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 24 }}>
                  {[{ n: 1, i: "🏫" }, { n: 2, i: "🎨" }, { n: 3, i: "👤" }].map((s, idx) => (
                    <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)", background: step >= s.n ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "#f1f5f9", color: step >= s.n ? "white" : "#94a3b8", boxShadow: step >= s.n ? "0 4px 16px rgba(99,102,241,0.3)" : "none" }}>{s.i}</div>
                      {idx < 2 && <div style={{ width: 24, height: 3, borderRadius: 2, background: step > s.n ? "linear-gradient(90deg, #2563eb, #7c3aed)" : "#e2e8f0", transition: "all 0.5s" }} />}
                    </div>
                  ))}
                </div>

                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div><label style={labelStyle}>School Name *</label><input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} style={iStyle} onFocus={iFocus} onBlur={iBlur} placeholder="e.g. Ifelyn Smart Kids Academy" /></div>
                    <div><label style={labelStyle}>Address</label><input type="text" value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)} style={iStyle} onFocus={iFocus} onBlur={iBlur} placeholder="e.g. Asaba, Delta State" /></div>
                    <div><label style={labelStyle}>Motto</label><input type="text" value={schoolMotto} onChange={e => setSchoolMotto(e.target.value)} style={iStyle} onFocus={iFocus} onBlur={iBlur} placeholder="e.g. Knowledge is Power" /></div>
                    <button onClick={nextStep} style={btnPrimary}>Continue →</button>
                  </div>
                )}
                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
                    <div onClick={() => fileInputRef.current?.click()} style={{ width: 130, height: 130, borderRadius: 28, border: "3px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: logoPreview ? "white" : "linear-gradient(135deg, #f8fafc, #eef2ff)", overflow: "hidden" }}>
                      {logoPreview ? <img src={logoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div style={{ textAlign: "center" }}><div style={{ fontSize: 40 }}>📷</div><div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800, marginTop: 4 }}>Upload Logo</div></div>}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleLogoSelect} accept="image/*" style={{ display: "none" }} />
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>PNG or JPG • Max 2MB • Shows on report cards</div>
                    {logoPreview && <button onClick={() => { setLogoFile(null); setLogoPreview(null); }} style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Remove logo</button>}
                    <div style={{ display: "flex", gap: 12, width: "100%" }}>
                      <button onClick={() => { setError(""); setStep(1); }} style={{ flex: 1, padding: 16, borderRadius: 16, border: "2px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
                      <button onClick={nextStep} style={{ flex: 1, padding: 16, borderRadius: 16, border: "none", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{logoFile ? "Continue →" : "Skip →"}</button>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div><label style={labelStyle}>Full Name *</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={iStyle} onFocus={iFocus} onBlur={iBlur} placeholder="e.g. Mrs. Okonkwo" /></div>
                    <div><label style={labelStyle}>Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={iStyle} onFocus={iFocus} onBlur={iBlur} placeholder="admin@school.com" /></div>
                    <div><label style={labelStyle}>Password *</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} style={iStyle} onFocus={iFocus} onBlur={iBlur} placeholder="At least 6 characters" /></div>
                    <div><label style={labelStyle}>Confirm Password *</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleRegister()} style={iStyle} onFocus={iFocus} onBlur={iBlur} placeholder="••••••••" /></div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button onClick={() => { setError(""); setStep(2); }} style={{ padding: "16px 22px", borderRadius: 16, border: "2px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>←</button>
                      <button onClick={handleRegister} disabled={loading} style={{ ...btnPrimary, flex: 1, opacity: loading ? 0.6 : 1 }}>{loading ? "Creating school..." : "Create School 🚀"}</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "white", padding: "90px 20px", textAlign: "center" }}>
        <ScrollReveal><div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#6366f1", letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Welcome to EasyAcad</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 900, color: "#0f172a", lineHeight: 1.2, marginBottom: 20 }}>The simplest way to generate school report cards</h2>
          <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.8, fontWeight: 500 }}>Teachers spend days calculating totals, ranking students, and filling report cards manually. EasyAcad eliminates that stress completely. Enter scores once — everything else is automatic.</p>
        </div></ScrollReveal>
      </div>

      <div style={{ background: "#f8fafc", padding: "90px 20px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 50 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#6366f1", letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Features</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "#0f172a" }}>Everything your school needs</h2>
            </div>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
                <div className="feat-card" style={{ background: "white", borderRadius: 22, padding: 30, boxShadow: "0 4px 16px rgba(0,0,0,0.04)", transition: "all 0.3s ease", border: "1px solid #f1f5f9", height: "100%" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 500 }}>{f.desc}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "white", padding: "90px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 50 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#6366f1", letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>How It Works</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "#0f172a" }}>4 simple steps</h2>
            </div>
          </ScrollReveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {STEPS.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.15} direction={i % 2 === 0 ? "left" : "right"}>
                <div className="step-card" style={{ display: "flex", gap: 20, alignItems: "center", background: "#f8fafc", borderRadius: 22, padding: 28, border: "1px solid #f1f5f9", transition: "all 0.3s ease" }}>
                  <div style={{ width: 68, height: 68, borderRadius: 20, flexShrink: 0, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: "#6366f1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Step {s.num}</div>
                    <div style={{ fontSize: 19, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 500 }}>{s.desc}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", padding: "90px 20px", color: "white" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40 }}>
          <ScrollReveal direction="left">
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#60a5fa", letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Our Mission</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, marginBottom: 16 }}>Simplify school administration across Africa</h3>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontWeight: 500 }}>Teachers should spend their time teaching, not calculating results. EasyAcad's mission is to digitize result compilation — the most stressful administrative task in schools — starting with Nigerian primary schools.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.2}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#a78bfa", letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Our Vision</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, marginBottom: 16 }}>Every school, digitally empowered</h3>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontWeight: 500 }}>Every school — no matter how small — should have access to professional, accurate, beautifully designed report cards. Where result week takes 30 minutes, not 7 days.</p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div style={{ background: "#f8fafc", padding: "90px 20px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <ScrollReveal>
            <div style={{ textAlign: "center", marginBottom: 50 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#6366f1", letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Get In Touch</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "#0f172a" }}>Contact Us</h2>
            </div>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { icon: "📧", label: "Email", value: "hello@geteasyacad.com", sub: "We reply within 24 hours" },
              { icon: "📞", label: "Phone", value: "0907 909 8659", sub: "Mon-Fri, 8am - 5pm" },
              { icon: "💬", label: "WhatsApp", value: "0907 909 8659", sub: "Quick support" },
            ].map((c, i) => (
              <ScrollReveal key={i} delay={i * 0.15} direction="scale">
                <div style={{ background: "white", borderRadius: 22, padding: 28, textAlign: "center", border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#6366f1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{c.sub}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#0f172a", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "white" }}>EasyAcad</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Automated report card generation for Nigerian schools</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 8 }}>© 2026 EasyAcad. All rights reserved.</div>
      </div>
    </div>
  );
}