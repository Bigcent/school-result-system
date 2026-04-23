import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { reference, plan, schoolName, contactName, contactEmail, contactPhone, studentCount, maxClasses, maxStudents, canPrint } = body;

    // Verify payment with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return Response.json({ success: false, error: "Payment verification failed" }, { status: 400 });
    }

    // Generate unique access code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from("access_codes")
        .select("code")
        .eq("code", code)
        .single();
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    // Save access code to database
    const { error: insertError } = await supabase.from("access_codes").insert({
      code,
      plan: plan,
      max_classes: maxClasses || null,
      max_students_per_class: maxStudents || null,
      can_print: canPrint !== false,
      used: false,
      expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
      notes: `Paystack payment: ${reference} | School: ${schoolName} | Contact: ${contactName} (${contactPhone}) | Students: ${studentCount} | Email: ${contactEmail}`,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return Response.json({ success: false, error: "Failed to generate access code" }, { status: 500 });
    }

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://geteasyacad.com";
    const inviteLink = `${baseUrl}/login?code=${code}`;

    return Response.json({
      success: true,
      code,
      inviteLink,
      plan,
      schoolName,
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}