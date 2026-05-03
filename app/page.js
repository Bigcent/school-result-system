"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const FEATURES = [
  { icon: "⚡", title: "Instant Results", desc: "Enter scores once — totals, rankings, and grades calculate automatically." },
  { icon: "📊", title: "Smart Report Cards", desc: "Professional report cards with auto-generated remarks, attendance, and school branding." },
  { icon: "🎨", title: "Your School, Your Brand", desc: "Custom colors, logo upload, and personalized interface for every school." },
  { icon: "🖨️", title: "Print-Ready", desc: "Report cards and class rankings print beautifully on A4 paper." },
  { icon: "🔒", title: "Secure & Private", desc: "Each school's data is completely isolated. Only your staff can access results." },
  { icon: "📱", title: "Works Everywhere", desc: "Use on phone, tablet, or laptop. No app download needed — just open your browser." },
];

const STEPS = [
  { num: "01", icon: "🏫", title: "Register Your School", desc: "Enter school name, address, motto, and upload your logo. Takes 2 minutes." },
  { num: "02", icon: "📋", title: "Set Up Classes & Subjects", desc: "Add classes and subjects from our library of 30+ Nigerian curriculum subjects." },
  { num: "03", icon: "✏️", title: "Enter Scores", desc: "Simple spreadsheet-style grid. Just type CA1, CA2, and Exam scores." },
  { num: "04", icon: "📄", title: "Print Report Cards", desc: "Rankings, remarks, attendance — ready to distribute to parents." },
];

const PLANS = [
  {
    name: "Self-Service",
    desc: "Your teachers use the platform directly",
    features: ["Full platform access", "Generate report cards", "Print broadsheets & rankings", "Custom school branding", "Online access anytime"],
    highlight: false,
    ideal: "Schools with IT-savvy staff"
  },
  {
    name: "Assisted",
    desc: "Send us the scores — we handle the rest",
    features: ["Everything in Self-Service", "We enter & format your scores", "We review for errors", "Ready-to-print delivery", "Dedicated support"],
    highlight: true,
    ideal: "Schools that want help"
  },
  {
    name: "Premium",
    desc: "Fully done-for-you service",
    features: ["Everything in Assisted", "We process everything", "Professional printing", "Physical delivery to school", "Priority support"],
    highlight: false,
    ideal: "Schools that want zero effort"
  },
];

const NAVY = "#0F2847";
const NAVY_LIGHT = "#1E3A5F";
const GOLD = "#D4A017";
const CREAM = "#FAF7F0";
const CREAM_WARM = "#F5EFDF";
const WHATSAPP_LINK = "https://wa.me/2349079098659?text=Hello%20Gradora%2C%20I%27m%20interested%20in%20your%20school%20result%20processing%20service.%20Please%20share%20more%20details.";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", color: NAVY, background: CREAM }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(15,40,71,0.35); }
        .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(212,160,23,0.4); }
        .nav-link:hover { color: ${GOLD}; }
        .feat-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(15,40,71,0.12); border-color: ${GOLD} !important; }
        .plan-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(15,40,71,0.15); }
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "rgba(250,247,240,0.95)" : "rgba(250,247,240,0.7)", backdropFilter: "blur(20px)", borderBottom: scrolled ? `1px solid ${GOLD}33` : "1px solid transparent", transition: "all 0.3s ease", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={() => scrollTo("top")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: NAVY, border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: GOLD, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>G</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: NAVY }}>Gradora</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span className="nav-link" onClick={() => scrollTo("features")} style={{ fontSize: 14, fontWeight: 700, color: NAVY_LIGHT, cursor: "pointer", transition: "color 0.2s" }}>Features</span>
            <span className="nav-link" onClick={() => scrollTo("how")} style={{ fontSize: 14, fontWeight: 700, color: NAVY_LIGHT, cursor: "pointer", transition: "color 0.2s" }}>How It Works</span>
            <span className="nav-link" onClick={() => scrollTo("plans")} style={{ fontSize: 14, fontWeight: 700, color: NAVY_LIGHT, cursor: "pointer", transition: "color 0.2s" }}>Plans</span>
            <Link href="/demo" className="nav-link" style={{ fontSize: 14, fontWeight: 700, color: NAVY_LIGHT, textDecoration: "none", transition: "color 0.2s" }}>Demo</Link>
            <span className="nav-link" onClick={() => scrollTo("contact")} style={{ fontSize: 14, fontWeight: 700, color: NAVY_LIGHT, cursor: "pointer", transition: "color 0.2s" }}>Contact</span>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 700, color: NAVY, textDecoration: "none" }}>Sign In</Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ padding: "10px 20px", borderRadius: 10, background: GOLD, color: NAVY, fontSize: 14, fontWeight: 900, textDecoration: "none", transition: "all 0.3s ease", display: "inline-block", border: `2px solid ${GOLD}` }}>Contact Us</a>
          </div>
        </div>
      </nav>

      <section id="top" style={{ minHeight: "100vh", paddingTop: 100, background: `linear-gradient(180deg, ${CREAM} 0%, ${CREAM_WARM} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "130px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "15%", left: "8%", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}22, transparent)`, filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${NAVY}22, transparent)`, filter: "blur(50px)" }} />
        <div style={{ maxWidth: 900, textAlign: "center", animation: "fadeUp 0.8s ease-out", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: 999, background: "white", border: `1.5px solid ${GOLD}`, fontSize: 12, fontWeight: 800, color: NAVY, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 28 }}>🇳🇬 Built for Nigerian Schools</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(38px, 6vw, 68px)", fontWeight: 900, color: NAVY, lineHeight: 1.1, marginBottom: 24, letterSpacing: -1 }}>
            End-of-term results<br />
            <span style={{ color: GOLD, fontStyle: "italic" }}>without the stress.</span>
          </h1>
          <p style={{ fontSize: 18, color: NAVY_LIGHT, lineHeight: 1.7, fontWeight: 500, maxWidth: 620, margin: "0 auto 40px" }}>Give us the scores — we deliver finished report cards, broadsheets, and rankings. Designed for Nigerian primary and secondary schools.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: "16px 34px", borderRadius: 12, background: NAVY, color: "white", fontSize: 16, fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 24px rgba(15,40,71,0.25)", transition: "all 0.3s ease", display: "inline-block" }}>💬 Chat With Us</a>
            <Link href="/demo" style={{ padding: "16px 34px", borderRadius: 12, background: "white", border: `2px solid ${NAVY}`, color: NAVY, fontSize: 16, fontWeight: 800, textDecoration: "none", transition: "all 0.3s ease", display: "inline-block" }}>▶ Watch Demo</Link>
          </div>
          <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "white", border: `1px solid ${GOLD}44` }}>
            <span style={{ color: GOLD }}>★</span>
            <span style={{ fontSize: 13, color: NAVY, fontWeight: 700 }}>Trusted by Ifelyn Smart Kids Academy, Asaba</span>
          </div>
        </div>
      </section>

      <section id="features" style={{ background: "white", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: GOLD, letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Features</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, color: NAVY, marginBottom: 16 }}>Everything your school needs</h2>
            <p style={{ fontSize: 17, color: NAVY_LIGHT, maxWidth: 600, margin: "0 auto", fontWeight: 500 }}>From score entry to printed report cards — all in one place.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feat-card" style={{ background: CREAM, borderRadius: 18, padding: 32, border: `1.5px solid ${GOLD}22`, transition: "all 0.3s ease" }}>
                <div style={{ fontSize: 40, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontSize: 19, fontWeight: 900, color: NAVY, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: NAVY_LIGHT, lineHeight: 1.7, fontWeight: 500 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" style={{ background: CREAM, padding: "100px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: GOLD, letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>How It Works</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, color: NAVY }}>4 simple steps</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 24, alignItems: "center", background: "white", borderRadius: 20, padding: 28, border: `1.5px solid ${GOLD}22`, boxShadow: "0 2px 8px rgba(15,40,71,0.04)" }}>
                <div style={{ width: 72, height: 72, borderRadius: 18, flexShrink: 0, background: NAVY, border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Step {s.num}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: NAVY, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: NAVY_LIGHT, lineHeight: 1.7, fontWeight: 500 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" style={{ background: "white", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: GOLD, letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Plans</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, color: NAVY, marginBottom: 16 }}>Choose the level of help<br />that works for your school</h2>
            <p style={{ fontSize: 17, color: NAVY_LIGHT, maxWidth: 600, margin: "0 auto", fontWeight: 500 }}>Pricing is customized based on your school size and needs. Contact us for a quote.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {PLANS.map((p, i) => (
              <div key={i} className="plan-card" style={{ background: p.highlight ? NAVY : "white", color: p.highlight ? "white" : NAVY, borderRadius: 22, padding: 36, border: p.highlight ? `2px solid ${GOLD}` : `1.5px solid ${GOLD}44`, position: "relative", transition: "all 0.3s ease", boxShadow: p.highlight ? "0 16px 40px rgba(15,40,71,0.25)" : "none" }}>
                {p.highlight && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: GOLD, color: NAVY, padding: "5px 18px", borderRadius: 999, fontSize: 11, fontWeight: 900, letterSpacing: 1.5 }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: 13, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14, color: GOLD }}>{p.name}</h3>
                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{p.desc}</p>
                <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 600, marginBottom: 24, fontStyle: "italic" }}>Ideal for: {p.ideal}</div>
                <div style={{ height: 1, background: p.highlight ? "rgba(255,255,255,0.2)" : `${GOLD}33`, marginBottom: 24 }} />
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, display: "flex", gap: 10 }}>
                      <span style={{ color: GOLD, fontWeight: 900 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", gap: 10 }}>
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "block", textAlign: "center", padding: "14px", borderRadius: 10, background: p.highlight ? GOLD : NAVY, color: p.highlight ? NAVY : "white", fontSize: 14, fontWeight: 900, textDecoration: "none" }}>Get a Quote</a>
                  <Link href="/demo" style={{ display: "block", textAlign: "center", padding: "14px 16px", borderRadius: 10, background: "transparent", border: p.highlight ? "2px solid white" : `2px solid ${NAVY}`, color: p.highlight ? "white" : NAVY, fontSize: 14, fontWeight: 900, textDecoration: "none" }}>Demo</Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 15, color: NAVY_LIGHT, fontWeight: 600, marginBottom: 6 }}>Not sure which plan is right? We'll help you choose.</p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, color: GOLD, fontWeight: 800, textDecoration: "none" }}>💬 Chat with us on WhatsApp →</a>
          </div>
        </div>
      </section>

      <section id="contact" style={{ background: NAVY, padding: "100px 24px", color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}15, transparent)`, filter: "blur(60px)" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: GOLD, letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }}>Get In Touch</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, marginBottom: 16 }}>Ready to start?</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", marginBottom: 40, fontWeight: 500 }}>Contact us for a custom quote based on your school's needs.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ padding: "16px 32px", borderRadius: 12, background: GOLD, color: NAVY, fontSize: 16, fontWeight: 900, textDecoration: "none" }}>💬 WhatsApp Us →</a>
            <Link href="/demo" style={{ padding: "16px 32px", borderRadius: 12, background: "transparent", border: "2px solid white", color: "white", fontSize: 16, fontWeight: 900, textDecoration: "none" }}>Watch Demo</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { icon: "📧", label: "Email", value: "hello@gradora.ng" },
              { icon: "📞", label: "Phone", value: "0907 909 8659" },
              { icon: "💬", label: "WhatsApp", value: "0907 909 8659" },
            ].map((c, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 28, border: `1px solid ${GOLD}33` }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: GOLD, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 }}>{c.label}</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: "#0A1B33", padding: "36px 24px", textAlign: "center", borderTop: `1px solid ${GOLD}22` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: NAVY, border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: GOLD, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>G</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "white" }}>Gradora</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Result processing for Nigerian schools</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>© 2026 Gradora. All rights reserved.</div>
      </footer>
    </div>
  );
}