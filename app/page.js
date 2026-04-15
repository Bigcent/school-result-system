"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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
  { num: "02", icon: "📋", title: "Set Up Classes & Subjects", desc: "Add classes and subjects from our library of 30+ Nigerian curriculum subjects." },
  { num: "03", icon: "✏️", title: "Enter Scores", desc: "Simple spreadsheet-style grid. Just type CA1, CA2, and Exam scores." },
  { num: "04", icon: "📄", title: "Print Report Cards", desc: "Rankings, remarks, attendance — ready to distribute to parents." },
];

const PRICING = [
  { name: "Basic", price: "₦300", period: "per student / term", desc: "Self-service platform", features: ["Full platform access", "Generate report cards", "Print broadsheets", "Online access"], highlight: false },
  { name: "Assisted", price: "₦700", period: "per student / term", desc: "We help format & review", features: ["Everything in Basic", "We format your scores", "We review for errors", "Ready-to-print delivery"], highlight: true },
  { name: "Premium", price: "₦1,500", period: "per student / term", desc: "Fully done-for-you", features: ["Everything in Assisted", "We process everything", "Printed & delivered", "Priority support"], highlight: false },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", color: "#1e293b" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(37,99,235,0.4); }
        .nav-link:hover { color: #2563eb; }
        .feat-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        .price-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)", borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent", transition: "all 0.3s ease", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={() => scrollTo("top")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1B3A6B, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#1B3A6B" }}>EasyAcad</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <span className="nav-link" onClick={() => scrollTo("features")} style={{ fontSize: 14, fontWeight: 700, color: "#475569", cursor: "pointer", transition: "color 0.2s" }}>Features</span>
            <span className="nav-link" onClick={() => scrollTo("how")} style={{ fontSize: 14, fontWeight: 700, color: "#475569", cursor: "pointer", transition: "color 0.2s" }}>How It Works</span>
            <span className="nav-link" onClick={() => scrollTo("pricing")} style={{ fontSize: 14, fontWeight: 700, color: "#475569", cursor: "pointer", transition: "color 0.2s" }}>Pricing</span>
            <span className="nav-link" onClick={() => scrollTo("contact")} style={{ fontSize: 14, fontWeight: 700, color: "#475569", cursor: "pointer", transition: "color 0.2s" }}>Contact</span>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 700, color: "#1B3A6B", textDecoration: "none" }}>Sign In</Link>
            <Link href="/login" className="btn-primary" style={{ padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, #1B3A6B, #2563eb)", color: "white", fontSize: 14, fontWeight: 800, textDecoration: "none", transition: "all 0.3s ease", display: "inline-block" }}>Get Started</Link>
          </div>
        </div>
      </nav>

      <section id="top" style={{ minHeight: "100vh", paddingTop: 100, background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 60px" }}>
        <div style={{ maxWidth: 900, textAlign: "center", animation: "fadeUp 0.8s ease-out" }}>
          <div style={{ display: "inline-block", padding: "8px 18px", borderRadius: 999, background: "white", border: "1px solid #cbd5e1", fontSize: 12, fontWeight: 800, color: "#1B3A6B", letterSpacing: 1, textTransform: "uppercase", marginBottom: 24 }}>🇳🇬 Built for Nigerian Schools</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, color: "#0f172a", lineHeight: 1.1, marginBottom: 24 }}>Result Processing<br /><span style={{ background: "linear-gradient(135deg, #1B3A6B, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Made Effortless</span></h1>
          <p style={{ fontSize: 18, color: "#64748b", lineHeight: 1.7, fontWeight: 500, maxWidth: 600, margin: "0 auto 40px" }}>Stop spending days on end-of-term results. Give us the scores — we deliver finished report cards, broadsheets, and rankings in hours, not days.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login" className="btn-primary" style={{ padding: "16px 32px", borderRadius: 14, background: "linear-gradient(135deg, #1B3A6B, #2563eb)", color: "white", fontSize: 16, fontWeight: 800, textDecoration: "none", boxShadow: "0 6px 20px rgba(37,99,235,0.3)", transition: "all 0.3s ease", display: "inline-block" }}>Get Started Free →</Link>
            <Link href="/demo" style={{ padding: "16px 32px", borderRadius: 14, background: "white", border: "2px solid #1B3A6B", color: "#1B3A6B", fontSize: 16, fontWeight: 800, textDecoration: "none", transition: "all 0.3s ease", display: "inline-block" }}>▶ Watch Demo</Link>
          </div>
          <div style={{ marginTop: 40, fontSize: 13, color: "#64748b", fontWeight: 600 }}>✅ Trusted by Ifelyn Smart Kids Academy, Asaba</div>
        </div>
      </section>

      <section id="features" style={{ background: "white", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#2563eb", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Features</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: "#0f172a", marginBottom: 16 }}>Everything your school needs</h2>
            <p style={{ fontSize: 17, color: "#64748b", maxWidth: 600, margin: "0 auto", fontWeight: 500 }}>From score entry to printed report cards — all in one place.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card" style={{ background: "white", borderRadius: 20, padding: 32, border: "1px solid #e2e8f0", transition: "all 0.3s ease" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 19, fontWeight: 900, color: "#0f172a", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 500 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" style={{ background: "#f8fafc", padding: "100px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#2563eb", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>How It Works</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: "#0f172a" }}>4 simple steps</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 24, alignItems: "center", background: "white", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0" }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, flexShrink: 0, background: "linear-gradient(135deg, #1B3A6B, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#2563eb", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Step {s.num}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, fontWeight: 500 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ background: "white", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#2563eb", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: "#0f172a", marginBottom: 16 }}>Simple, flexible plans</h2>
            <p style={{ fontSize: 17, color: "#64748b", maxWidth: 600, margin: "0 auto", fontWeight: 500 }}>Choose the level of help that works for your school.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {PRICING.map((p, i) => (
              <div key={i} className="price-card" style={{ background: p.highlight ? "linear-gradient(135deg, #1B3A6B, #2563eb)" : "white", color: p.highlight ? "white" : "#0f172a", borderRadius: 24, padding: 36, border: p.highlight ? "none" : "2px solid #e2e8f0", position: "relative", transition: "all 0.3s ease", boxShadow: p.highlight ? "0 12px 40px rgba(37,99,235,0.25)" : "none" }}>
                {p.highlight && <div style={{ position: "absolute", top: -12, right: 24, background: "#fbbf24", color: "#1B3A6B", padding: "4px 14px", borderRadius: 999, fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>POPULAR</div>}
                <h3 style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, opacity: p.highlight ? 0.9 : 0.6 }}>{p.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900 }}>{p.price}</span>
                </div>
                <div style={{ fontSize: 12, opacity: p.highlight ? 0.8 : 0.5, fontWeight: 600, marginBottom: 8 }}>{p.period}</div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 24, opacity: p.highlight ? 0.9 : 0.7 }}>{p.desc}</p>
                <div style={{ height: 1, background: p.highlight ? "rgba(255,255,255,0.2)" : "#e2e8f0", marginBottom: 24 }} />
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, display: "flex", gap: 10 }}>
                      <span style={{ color: p.highlight ? "#fbbf24" : "#16a34a", fontWeight: 900 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/demo" style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 12, background: p.highlight ? "white" : "#1B3A6B", color: p.highlight ? "#1B3A6B" : "white", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>Book a Demo</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" style={{ background: "linear-gradient(135deg, #0f172a, #1B3A6B)", padding: "100px 24px", color: "white" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#60a5fa", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Get In Touch</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, marginBottom: 16 }}>Ready to start?</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", marginBottom: 40, fontWeight: 500 }}>Book a free demo or contact us directly.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { icon: "📧", label: "Email", value: "hello@geteasyacad.com" },
              { icon: "📞", label: "Phone", value: "0907 909 8659" },
              { icon: "💬", label: "WhatsApp", value: "0907 909 8659" },
            ].map((c, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 28, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#60a5fa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: "#0f172a", padding: "40px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, #1B3A6B, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "white" }}>EasyAcad</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Result processing for Nigerian schools</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>© 2026 EasyAcad. All rights reserved.</div>
      </footer>
    </div>
  );
}