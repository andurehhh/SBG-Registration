import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateEmailHTML } from "../_shared/emailTemplate.ts";
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

    // Queue approval email instead of sending directly
    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:3000";
    const html = generateEmailHTML({
      recipientName: member.full_name,
      body: `Congratulations! Your application to the Student Builder Group (SBG) has been approved!\n\nYour SBG ID: ${sbgId}\n\nYou are now an official member of SBG PUP Biñan. Visit the portal to view and download your digital membership ID.`,
      signature: "Welcome to the team!\nStudent Builder Group\nPUP Biñan Campus",
    });

    const fromEmail = Deno.env.get("GMAIL_ADDRESS")!;
    const { error: queueError } = await supabase.from("EmailQueue").insert({
      to: member.email,
      subject: "Welcome to SBG! Your Membership is Approved",
      html,
      from_email: fromEmail,
      status: "pending",
    });

    if (queueError) throw queueError;

    return Response.json({ success: true, data: updated }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Approve error:", err);
    return Response.json({ success: false, error: "Failed to approve member" }, { status: 500, headers: CORS_HEADERS });
  }
});
