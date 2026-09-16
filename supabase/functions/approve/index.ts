import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateEmailHTML, SOCIAL_LINKS } from "../_shared/emailTemplate.ts";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";
import { sendEmailViaLambda } from "../_shared/emailSender.ts";

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

    // Queue approval email and send immediately
    const appUrl = (Deno.env.get("APP_URL") || "https://sbg-registration.vercel.app").replace(/\/$/, "");
    const html = generateEmailHTML({
      recipientName: member.full_name,
      body: `Congratulations! Your membership application has been approved, and you are now officially part of the <b>AWS Student Builder Group – PUP Biñan</b> community.\n\nYour official SBG Member ID is:\n<b>${sbgId}</b>\n\nYou can view and download your digital membership ID here:\n<a href="${appUrl}/id-finder">${appUrl}/id-finder</a>\n\nAs the Lead and Founder, I'm excited to welcome you to a community where students learn, build, collaborate, and grow through cloud technology and hands-on experiences.\n\nHere at AWS, "It's Always Day One!" This reminds us to stay curious, keep learning, and approach every challenge with the excitement of a new beginning.\n\n<b>Stay connected through our official channels:</b>\n• Facebook Page: <a href="${SOCIAL_LINKS.facebook}">${SOCIAL_LINKS.facebook}</a>\n• Messenger Community: <a href="${SOCIAL_LINKS.messenger}">${SOCIAL_LINKS.messenger}</a>\n• Instagram: <a href="${SOCIAL_LINKS.instagram}">${SOCIAL_LINKS.instagram}</a>\n• Official Website: Coming soon — stay tuned!\n\nPlease join our <b>Messenger community first</b>, as it will be our primary channel for announcements, activities, and member coordination.\n\nWelcome to AWS SBG PUP Biñan. We're looking forward to learning and building with you!`,
      heading: "You're In! Welcome to AWS SBG PUP Biñan",
      signature: "Best regards,\nJohn Lexter Reyes\nLead and Founder\nAWS Student Builder Group – PUP Biñan",
    });

    const fromEmail = Deno.env.get("GMAIL_ADDRESS")!;
    const { data: queuedEmail, error: queueError } = await supabase.from("EmailQueue").insert({
      to: member.email,
      subject: "You're In! Welcome to AWS SBG PUP Biñan",
      html,
      from_email: fromEmail,
      status: "pending",
    }).select("id").single();

    if (queueError) throw queueError;

    const { error: processingError } = await supabase
      .from("EmailQueue")
      .update({ status: "processing" })
      .eq("id", queuedEmail.id);

    if (processingError) {
      console.error("Failed to mark approval email as processing:", processingError);
    }

    const sendResult = await sendEmailViaLambda(member.email, "Welcome to SBG! Your Membership is Approved", html, fromEmail);

    if (sendResult.success) {
      const { error: sentError } = await supabase
        .from("EmailQueue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", queuedEmail.id);

      if (sentError) throw sentError;

      return Response.json({ success: true, data: { ...updated, emailSent: true } }, { headers: CORS_HEADERS });
    }

    const { error: pendingError } = await supabase
      .from("EmailQueue")
      .update({
        status: "failed",
        error: sendResult.error || "Unknown email error",
        retry_count: 1,
      })
      .eq("id", queuedEmail.id);

    if (pendingError) {
      console.error("Failed to mark approval email as failed:", pendingError);
    }

    return Response.json({ success: true, data: { ...updated, emailSent: false, emailError: sendResult.error || "Failed to send approval email" } }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Approve error:", err);
    return Response.json({ success: false, error: "Failed to approve member" }, { status: 500, headers: CORS_HEADERS });
  }
});
