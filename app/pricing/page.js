"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const PLANS = [
  {
    id: "self_service",
    name: "Self-Service",
    price: 500,
    description: "Use the platform yourself",
    features: ["Full platform access", "Generate report cards", "Print broadsheets", "Student rankings", "Online access anytime"],
    highlight: false,
    maxClasses: 999,
    maxStudents: 999,
    canPrint: true,
  },
  {
    id: "assisted",
    name: "Assisted",
    price: 1000,
    description: "We handle digital processing",
    features: ["Everything in Self-Service", "We enter your scores", "We format and review", "Ready-to-print delivery", "Priority support"],
    highlight: true,
    maxClasses: 999,
    maxStudents: 999,
    canPrint: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 2000,
    description: "Fully done-for-you",
    features: ["Everything in Assisted", "We process everything", "Professional colour printing", "Physical delivery to school", "Dedicated account manager"],
    highlight: false,
    maxClasses: 999,
    maxStudents: 999,
    canPrint: true,
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [studentCount, setStudentCount] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const totalAmount = selectedPlan ? selectedPlan.price * (parseInt(studentCount) || 0) : 0;

  const handlePayment = () => {
    if (!selectedPlan) { setError("Please select a plan."); return; }
    if (!studentCount || parseInt(studentCount) < 1) { setError("Please enter number of students."); return; }
    if (!schoolName.trim()) { setError("Please enter your school name."); return; }
    if (!contactName.trim()) { setError("Please enter contact name."); return; }
    if (!contactEmail.trim()) { setError("Please enter contact email."); return; }
    if (!contactPhone.trim()) { setError("Please enter phone number."); return; }
    setError("");
    setLoading(true);

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: contactEmail.trim(),
      amount: totalAmount * 100,
      currency: "NGN",
      metadata: {
        custom_fields: [
          { display_name: "School Name", variable_name: "school_name", value: schoolName.trim() },
          { display_name: "Plan", variable_name: "plan", value: selectedPlan.id },
          { display_name: "Students", variable_name: "student_count", value: studentCount },
          { display_name: "Contact Name", variable_name: "contact_name", value: contactName.trim() },
          { display_name: "Contact Phone", variable_name: "contact_phone", value: contactPhone.trim() },
        ]
      },
      callback: async (response) => {
        try {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              plan: selectedPlan.id,
              schoolName: schoolName.trim(),
              contactName: contactName.trim(),
              contactEmail: contactEmail.trim(),
              contactPhone: contactPhone.trim(),
              studentCount: parseInt(studentCount),
              maxClasses: selectedPlan.maxClasses,
              maxStudents: selectedPlan.maxStudents,
              canPrint: selectedPlan.canPrint,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setSuccess({ inviteLink: data.inviteLink, code: data.code });
          } else {
            setError("Payment verified but failed to generate access. Contact us at 0907 909 8659.");
          }
        } catch (err) {
          setError("Payment successful but something went wrong. Contact us at 0907 909 8659 with reference: " + response.reference);
        }
        setLoading(false);
      },
      onClose: () => { setLoading(false); },
    });
    handler.openIframe();
  };

  const iStyle = { width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #e2e8f0", background: "white", fontSize: 14, fontWeight: 600, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <script src="https://js.paystack.co/v2/inline.js"></script>

      <nav style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1B3A6B, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#0F2847" }}>EasyAcad</span>
          </Link>
          <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: "#475569", textDecoration: "none" }}>← Back to Home</Link>
        </div>
      </nav>

      {success ? (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "#0F2847", marginBottom: 12 }}>Payment Successful!</h1>
          <p style={{ fontSize: 16, color: "#64748b", marginBottom: 32 }}>Your school is ready to get started. Use the link or code below to register.</p>
          <div style={{ background: "white", borderRadius: 20, padding: 32, border: "2px solid #16a34a", textAlign: "left", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#16a34a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Your Registration Details</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>INVITE LINK (click or share via WhatsApp)</div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#0F2847", wordBreak: "break-all" }}>
                <a href={success.inviteLink} style={{ color: "#0F2847", textDecoration: "none" }}>{success.inviteLink}</a>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>ACCESS CODE (enter manually during registration)</div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", fontSize: 24, fontWeight: 900, color: "#0F2847", letterSpacing: 4, textAlign: "center" }}>
                {success.code}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={success.inviteLink} style={{ padding: "14px 28px", borderRadius: 12, background: "#0F2847", color: "white", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>Register Now →</a>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Your EasyAcad registration link: ${success.inviteLink}\n\nOr use code: ${success.code}\n\nVisit geteasyacad.com/login to register.`)}`} target="_blank" style={{ padding: "14px 28px", borderRadius: 12, background: "#25D366", color: "white", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>Share via WhatsApp</a>
          </div>
          <div style={{ marginTop: 24, fontSize: 12, color: "#94a3b8" }}>Questions? Call 0907 909 8659</div>
        </div>
      ) : (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#2563eb", letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: "#0F2847", marginBottom: 12 }}>Choose your plan</h1>
            <p style={{ fontSize: 17, color: "#64748b", maxWidth: 600, margin: "0 auto" }}>Select a plan, enter your number of students, and pay securely. You will receive instant access to the platform.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
            {PLANS.map(plan => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div key={plan.id} onClick={() => { setSelectedPlan(plan); setError(""); }} style={{
                  background: plan.highlight ? "#0F2847" : "white",
                  color: plan.highlight ? "white" : "#0F2847",
                  borderRadius: 22, padding: 32,
                  border: isSelected ? "3px solid #D4A017" : plan.highlight ? "3px solid #D4A017" : "2px solid #e2e8f0",
                  cursor: "pointer", transition: "all 0.3s ease", position: "relative",
                  boxShadow: isSelected ? "0 8px 30px rgba(212,160,23,0.3)" : plan.highlight ? "0 8px 30px rgba(15,40,71,0.2)" : "none",
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                }}>
                  {plan.highlight && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#D4A017", color: "#0F2847", padding: "4px 16px", borderRadius: 999, fontSize: 11, fontWeight: 900, letterSpacing: 1.5 }}>MOST POPULAR</div>}
                  {isSelected && <div style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: "50%", background: "#D4A017", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#0F2847", fontWeight: 900 }}>✓</div>}
                  <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, color: "#D4A017" }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900 }}>₦{plan.price.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, marginBottom: 8 }}>per student / term</div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, opacity: 0.85 }}>{plan.description}</p>
                  <div style={{ height: 1, background: plan.highlight ? "rgba(255,255,255,0.15)" : "#e2e8f0", marginBottom: 20 }} />
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: "flex", gap: 8 }}>
                        <span style={{ color: "#D4A017", fontWeight: 900 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {selectedPlan && (
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <div style={{ background: "white", borderRadius: 22, padding: 32, border: "2px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#D4A017", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Complete Your Order — {selectedPlan.name} Plan</div>
                {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, fontWeight: 600, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>{error}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>School Name *</label>
                    <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} style={iStyle} placeholder="e.g. Ifelyn Smart Kids Academy" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Number of Students *</label>
                    <input type="number" value={studentCount} onChange={e => setStudentCount(e.target.value)} style={iStyle} placeholder="e.g. 200" min="1" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Contact Name *</label>
                    <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} style={iStyle} placeholder="e.g. Mrs. Okonkwo" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Email *</label>
                    <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={iStyle} placeholder="admin@school.com" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Phone / WhatsApp *</label>
                    <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={iStyle} placeholder="e.g. 0907 909 8659" />
                  </div>
                </div>

                {parseInt(studentCount) > 0 && (
                  <div style={{ background: "#f8fafc", borderRadius: 14, padding: 20, marginTop: 20, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Order Summary</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                      <span style={{ color: "#64748b" }}>{selectedPlan.name} Plan</span>
                      <span style={{ fontWeight: 700 }}>₦{selectedPlan.price.toLocaleString()} × {studentCount} students</span>
                    </div>
                    <div style={{ height: 1, background: "#e2e8f0", margin: "12px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
                      <span style={{ fontWeight: 900, color: "#0F2847" }}>Total</span>
                      <span style={{ fontWeight: 900, color: "#0F2847", fontFamily: "'Playfair Display', serif", fontSize: 24 }}>₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button onClick={handlePayment} disabled={loading || totalAmount === 0} style={{
                  width: "100%", padding: 18, borderRadius: 14, border: "none",
                  background: loading || totalAmount === 0 ? "#94a3b8" : "#0F2847",
                  color: "white", fontSize: 16, fontWeight: 900,
                  cursor: loading || totalAmount === 0 ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  marginTop: 20, transition: "all 0.3s ease",
                  boxShadow: loading || totalAmount === 0 ? "none" : "0 6px 20px rgba(15,40,71,0.3)",
                }}>
                  {loading ? "Processing..." : `Pay ₦${totalAmount.toLocaleString()} Securely →`}
                </button>

                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>🔒 Secured by Paystack</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>💳 Cards, Bank Transfer, USSD</span>
                </div>
              </div>
            </div>
          )}

          {!selectedPlan && (
            <div style={{ textAlign: "center", fontSize: 15, color: "#94a3b8", fontWeight: 600 }}>
              ☝️ Select a plan above to continue
            </div>
          )}
        </div>
      )}
    </div>
  );
}