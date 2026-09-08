import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";
import { generateEmailHTML } from "../_shared/emailTemplate.ts";

async function sendRejectionEmail(toEmail: string, fullName: string) {
  const html = generateEmailHTML({
    recipientName: fullName,
    heading: "Application update",
    body: `Thank you for your interest in joining the <b>AWS Student Builder Group</b> – PUP Biñan.\n\nAfter careful review, your application was not approved at this time. This isn't the end of the road — we run recruitment every term, and we'd genuinely love to see you apply again.\n\nIn the meantime, join our community using the links below to keep learning and building with us.`,
    signature: "Keep building,\nThe Core Team\nAWS Student Builder Group – PUP Biñan",
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: Deno.env.get("RESEND_FROM_EMAIL"), to: toEmail, subject: "SBG Application Status Update", html }),
  });
  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

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

    const { data: updated, error: updateError } = await supabase.from("Member").update({ status: "rejected" }).eq("id", id).select().single();
    if (updateError) throw updateError;

    sendRejectionEmail(member.email, member.full_name).catch(console.error);

    return Response.json({ success: true, data: updated }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Reject error:", err);
    return Response.json({ success: false, error: "Failed to reject member" }, { status: 500, headers: CORS_HEADERS });
  }
});
