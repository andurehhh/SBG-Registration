import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";
import { generateEmailHTML, SOCIAL_LINKS } from "../_shared/emailTemplate.ts";

async function sendRejectionEmail(toEmail: string, fullName: string) {
  const html = generateEmailHTML({
    recipientName: fullName,
    heading: "Application Status Update",
    body: `Thank you for your interest in joining the <b>AWS Student Builder Group – PUP Biñan</b> and for taking the time to submit your application.\n\nAfter reviewing your application, we regret to inform you that it was not approved for the current membership intake.\n\nThis decision does not define your potential as a student or builder. We encourage you to continue learning, developing your skills, and watching our official channels for future opportunities, events, and application periods.\n\n• Facebook Page: <a href="${SOCIAL_LINKS.facebook}">${SOCIAL_LINKS.facebook}</a>\n• Instagram: <a href="${SOCIAL_LINKS.instagram}">${SOCIAL_LINKS.instagram}</a>\n• Official Website: Coming soon — stay tuned!\n\nThank you again for your interest in AWS SBG PUP Biñan.`,
    signature: "Best regards,\nAWS Student Builder Group – PUP Biñan",
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
