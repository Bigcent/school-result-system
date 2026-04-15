"use client";
import Link from "next/link";

export default function DemoPage() {
  const phone = "2349079098659";
  const whatsappMsg = encodeURIComponent("Hi EasyAcad, I just watched your demo and I'd like to learn more for my school. My school name is:");
  const whatsappUrl = `https://wa.me/${phone}?text=${whatsappMsg}`;
  const emailSubject = encodeURIComponent("Demo Request - EasyAcad");
  const emailBody = encodeURIComponent("Hi EasyAcad team,\n\nI just watched your demo video and I'd like to learn more.\n\nSchool Name:\nMy Name:\nPhone:\nNumber of students:\n\nThank you.");
  const emailUrl = `mailto:hello@geteasyacad.com?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1B3A6B, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#1B3A6B" }}>EasyAcad</span>
          </Link>
          <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: "#475569", textDecoration: "none" }}>← Back to Home</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#2563eb", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>Watch Demo</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: "#0f172a", marginBottom: 16 }}>See EasyAcad in action</h1>
          <p style={{ fontSize: 17, color: "#64748b", maxWidth: 600, margin: "0 auto", fontWeight: 500 }}>Watch how schools save days every term with automated result processing.</p>
        </div>

        {/* Loom video embed */}
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.15)", marginBottom: 40 }}>
          <iframe
            src="https://www.loom.com/embed/b6050a8e6b394e2390ae5b6560493096"
            frameBorder="0"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          />
        </div>

        <div style={{ background: "white", borderRadius: 24, padding: 40, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>Ready to talk to us?</h2>
          <p style={{ fontSize: 15, color: "#64748b", marginBottom: 28, fontWeight: 500 }}>Reach out and we'll set up a free trial for one of your classes.</p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "16px 32px", borderRadius: 14, background: "#25D366", color: "white", fontSize: 16, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 6px 20px rgba(37,211,102,0.3)" }}>
              💬 Message on WhatsApp
            </a>
            <a href={emailUrl} style={{ padding: "16px 32px", borderRadius: 14, background: "linear-gradient(135deg, #1B3A6B, #2563eb)", color: "white", fontSize: 16, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 6px 20px rgba(37,99,235,0.3)" }}>
              📧 Send Email
            </a>
          </div>

          <div style={{ paddingTop: 24, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", fontSize: 14, color: "#64748b" }}>
            <div><strong style={{ color: "#1B3A6B" }}>📞 Phone:</strong> 0907 909 8659</div>
            <div><strong style={{ color: "#1B3A6B" }}>📧 Email:</strong> hello@geteasyacad.com</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/login" style={{ padding: "14px 28px", borderRadius: 12, background: "white", border: "2px solid #1B3A6B", color: "#1B3A6B", fontSize: 14, fontWeight: 800, textDecoration: "none", display: "inline-block" }}>Or get started immediately →</Link>
        </div>
      </div>
    </div>
  );
}