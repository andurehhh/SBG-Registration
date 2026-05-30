import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";

function generateSbgId(year: number, sequence: number): string {
  return `SBG-${year}-${String(sequence).padStart(4, "0")}-PUPBC`;
}

function formatSchoolYear(date: Date): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

async function generateUniqueSbgId(supabase: ReturnType<typeof createClient>, year: number): Promise<string> {
  const { data: last } = await supabase.from("Member").select("sbg_id").like("sbg_id", `SBG-${year}-%`).order("sbg_id", { ascending: false }).limit(1).single();
  let nextSeq = 1;
  if (last?.sbg_id) {
    const seq = parseInt(last.sbg_id.split("-")[2], 10);
    if (!isNaN(seq)) nextSeq = seq + 1;
  }
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateSbgId(year, nextSeq + attempt);
    const { data: exists } = await supabase.from("Member").select("id").eq("sbg_id", candidate).single();
    if (!exists) return candidate;
  }
  throw new Error("Failed to generate unique SBG ID");
}

async function sendWelcomeEmail(toEmail: string, fullName: string, sbgId: string, studentNumber: string) {
  const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:3000";
  const html = `<!DOCTYPE html><html><body style="background:#0f1117;color:#E2E8F0;font-family:Inter,sans-serif;padding:32px;">
    <div style="max-width:600px;margin:0 auto;background:#1a1f2e;border-radius:8px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
      <h1 style="color:#ffffff;">Welcome to SBG! 🎉</h1>
      <p>Hi <strong>${fullName}</strong>, your application has been <strong style="color:#7C3AED;">approved</strong>.</p>
      <div style="background:#252b3b;border-radius:8px;padding:16px;margin:24px 0;">
        <p style="margin:0;font-size:12px;color:#94A3B8;">YOUR SBG ID</p>
        <p style="margin:8px 0 0;font-size:20px;color:#7C3AED;font-weight:bold;">${sbgId}</p>
      </div>
      <a href="${appUrl}/id-finder" style="display:inline-block;background:#7C3AED;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View My ID Card</a>
      <p style="color:#94A3B8;font-size:14px;margin-top:24px;">Enter student number <strong>${studentNumber}</strong> on the ID Finder page.</p>
    </div>
  </body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: Deno.env.get("RESEND_FROM_EMAIL"), to: toEmail, subject: "Welcome to SBG — Your Application Has Been Approved!", html }),
  });
  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  // 60 requests per IP per minute for admin actions
  if (isRateLimited(getClientIp(req), 60, 60 * 1000)) return rateLimitedResponse();

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ success: false, error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });

    const { id } = await req.json();
    const { data: member, error } = await supabase.from("Member").select("*").eq("id", id).single();
    if (error || !member) return Response.json({ success: false, error: "Member not found" }, { status: 404, headers: CORS_HEADERS });
    if (member.status !== "pending") return Response.json({ success: false, error: "Member is not pending" }, { status: 400, headers: CORS_HEADERS });

    const year = new Date(member.created_at).getFullYear();
    const sbgId = await generateUniqueSbgId(supabase, year);
    const schoolYear = formatSchoolYear(new Date(member.created_at));

    const { data: updated, error: updateError } = await supabase.from("Member").update({ status: "approved", sbg_id: sbgId, school_year: schoolYear }).eq("id", id).select().single();
    if (updateError) throw updateError;

    sendWelcomeEmail(member.email, member.full_name, sbgId, member.student_number).catch(console.error);

    return Response.json({ success: true, data: updated }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Approve error:", err);
    return Response.json({ success: false, error: "Failed to approve member" }, { status: 500, headers: CORS_HEADERS });
  }
});
