"use client";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
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
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Logo must be under 2MB."); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRegister = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!schoolName.trim()) { setError("Please enter your school name."); return; }
    if (!fullName.trim()) { setError("Please enter your full name."); return; }

    setLoading(true);
    setError("");

    try {
      // Step 1: Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) { setError("Registration error: " + authError.message); setLoading(false); return; }

      const userId = authData.user?.id;
      if (!userId) { setError("Registration failed. No user ID returned."); setLoading(false); return; }

      // Step 2: Sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Account created but could not sign in: " + signInError.message + ". Try logging in manually.");
        setMode("login");
        setLoading(false);
        return;
      }

      // Step 3: Create school
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .insert({
          name: schoolName.trim(),
          address: schoolAddress.trim() || null,
          motto: schoolMotto.trim() || null,
          theme: "royal",
        })
        .select()
        .single();

      if (schoolError) {
        setError("School creation failed: " + schoolError.message);
        setLoading(false);
        return;
      }

      if (!schoolData) {
        setError("School was not created. Please try again.");
        setLoading(false);
        return;
      }

      // Step 4: Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${schoolData.id}-logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from("logos").upload(fileName, logoFile, { upsert: true });
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("logos").getPublicUrl(fileName);
          const publicUrl = urlData.publicUrl + "?t=" + Date.now();

          await supabase
            .from("schools")
            .update({ logo_url: publicUrl })
            .eq("id", schoolData.id);
        }
      }

      // Step 5: Create user profile
      const { error: userError } = await supabase
        .from("users")
        .insert({
          id: userId,
          school_id: schoolData.id,
          full_name: fullName.trim(),
          role: "admin",
        });

      if (userError) {
        setError("Profile creation failed: " + userError.message + ". School was created. Please contact support.");
        setLoading(false);
        return;
      }

      // Step 6: Success
      window.location.href = "/dashboard";

    } catch (err) {
      setError("Something went wrong: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("Please enter your email address first."); return; }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset link sent to your email.");
    }
    setLoading(false);
  };

  const nextStep = () => {
    if (step === 1 && !schoolName.trim()) { setError("Please enter your school name."); return; }
    setError("");
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #2B5EA7 50%, #4A90D9 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-2xl font-bold text-white">School Results</h1>
          <p className="text-sm text-white/60 mt-1">Automated report card generation</p>
        </div>

        <div className="flex rounded-xl p-1 mb-4" style={{ background: "rgba(255,255,255,0.1)" }}>
          <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "login" ? "bg-white text-blue-900 shadow" : "text-white/70"}`}>
            Login
          </button>
          <button onClick={() => { setMode("register"); setStep(1); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "register" ? "bg-white text-blue-900 shadow" : "text-white/70"}`}>
            Register School
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
              {success}
            </div>
          )}

          {mode === "login" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="admin@school.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••" />
              </div>
              <button onClick={handleLogin} disabled={loading}
                className="w-full py-3.5 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors disabled:opacity-50">
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <button onClick={handleForgotPassword}
                className="w-full text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors py-1">
                Forgot password?
              </button>
            </div>
          )}

          {mode === "register" && (
            <>
              <div className="flex items-center justify-center gap-2 mb-5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= s ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-400"
                    }`}>{s}</div>
                    {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-blue-900" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>
              <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-4">
                {step === 1 && "School Information"}
                {step === 2 && "School Logo"}
                {step === 3 && "Your Account"}
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">School Name *</label>
                    <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. Evelyn Primary School" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Address</label>
                    <input type="text" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. 5 Okpanam Road, Asaba, Delta State" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Motto</label>
                    <input type="text" value={schoolMotto} onChange={(e) => setSchoolMotto(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. Knowledge is Power" />
                  </div>
                  <button onClick={nextStep}
                    className="w-full py-3.5 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors">
                    Next →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ background: logoPreview ? "white" : "#F9FAFB" }}>
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center">
                          <span className="text-3xl">🏫</span>
                          <div className="text-[10px] text-gray-400 font-semibold mt-1">Tap to upload</div>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleLogoSelect} accept="image/*" className="hidden" />
                    <div className="text-[10px] text-gray-400 mt-2">PNG or JPG, max 2MB. Shows on report cards.</div>
                    {logoPreview && (
                      <button onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                        className="text-xs text-red-500 font-semibold mt-2 hover:text-red-700">Remove logo</button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setError(""); setStep(1); }}
                      className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200">← Back</button>
                    <button onClick={nextStep}
                      className="flex-1 py-3.5 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800">
                      {logoFile ? "Next →" : "Skip →"}</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Your Full Name *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. Mrs. Okonkwo" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Email *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="admin@school.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Password *</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="At least 6 characters" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Confirm Password *</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="••••••••" />
                  </div>

                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <div className="bg-blue-900 text-white px-4 py-3 flex items-center gap-2">
                      {logoPreview && <img src={logoPreview} alt="" style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 4 }} />}
                      <div>
                        <div className="text-xs font-bold">{schoolName || "Your School"}</div>
                        <div className="text-[9px] text-white/50">{schoolAddress || "Address"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => { setError(""); setStep(2); }}
                      className="px-5 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200">←</button>
                    <button onClick={handleRegister} disabled={loading}
                      className="flex-1 py-3.5 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 disabled:opacity-50">
                      {loading ? "Creating school..." : "Create School Account"}</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-white/40 mt-4">School Result System v1.0</p>
      </div>
    </div>
  );
}