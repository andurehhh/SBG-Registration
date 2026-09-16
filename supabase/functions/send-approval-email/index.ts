import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateEmailHTML, SOCIAL_LINKS } from "../_shared/emailTemplate.ts";
import { CORS_HEADERS, corsResponse } from "../_shared/rateLimiter.ts";
import { sendEmailViaLambda } from "../_shared/emailSender.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ success: false, error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });

    const { memberId } = await req.json();
    
    if (!memberId) {
      return Response.json({ success: false, error: "memberId required" }, { status: 400, headers: CORS_HEADERS });
    }

    // Get member details
    const { data: member, error: memberError } = await supabase
      .from("Member")
      .select("email, full_name")
      .eq("id", memberId)
      .single();

    if (memberError || !member) {
      return Response.json({ success: false, error: "Member not found" }, { status: 404, headers: CORS_HEADERS });
    }

    const fromEmail = Deno.env.get("GMAIL_ADDRESS")!;
    const appUrl = (Deno.env.get("APP_URL") || "https://sbg-registration.vercel.app").replace(/\/$/, "");

    const html = generateEmailHTML({
      recipientName: member.full_name,
      body: `Congratulations! Your membership application has been approved, and you are now officially part of the <b>AWS Student Builder Group – PUP Biñan</b> community.\n\nYou can view and download your official digital membership ID here:\n<a href="${appUrl}/id-finder">${appUrl}/id-finder</a>\n\nAs the Lead and Founder, I'm excited to welcome you to a community where students learn, build, collaborate, and grow through cloud technology and hands-on experiences.\n\nHere at AWS, "It's Always Day One!" This reminds us to stay curious, keep learning, and approach every challenge with the excitement of a new beginning.\n\n<b>Stay connected through our official channels:</b>\n• Facebook Page: <a href="${SOCIAL_LINKS.facebook}">${SOCIAL_LINKS.facebook}</a>\n• Messenger Community: <a href="${SOCIAL_LINKS.messenger}">${SOCIAL_LINKS.messenger}</a>\n• Instagram: <a href="${SOCIAL_LINKS.instagram}">${SOCIAL_LINKS.instagram}</a>\n• Official Website: Coming soon — stay tuned!\n\nPlease join our <b>Messenger community first</b>, as it will be our primary channel for announcements, activities, and member coordination.\n\nWelcome to AWS SBG PUP Biñan. We're looking forward to learning and building with you!`,
      heading: "You're In! Welcome to AWS SBG PUP Biñan",
      signature: "Best regards,\nJohn Lexter Reyes\nLead and Founder\nAWS Student Builder Group – PUP Biñan",
    });

    const { data: queuedEmail, error: insertError } = await supabase
      .from("EmailQueue")
      .insert({
        to: member.email,
        subject: "You're In! Welcome to AWS SBG PUP Biñan",
        html,
        from_email: fromEmail,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Queue insert error:", insertError);
      return Response.json(
        { success: false, error: insertError.message },
        { status: 500, headers: CORS_HEADERS }
      );
    }

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

      if (sentError) {
        return Response.json({ success: false, error: sentError.message }, { status: 500, headers: CORS_HEADERS });
      }

      return Response.json({ success: true, data: { emailSent: true } }, { status: 200, headers: CORS_HEADERS });
    }

    await supabase.from("EmailQueue").update({
      status: "failed",
      error: sendResult.error || "Unknown email error",
      retry_count: 1,
    }).eq("id", queuedEmail.id);

    return Response.json({ success: true, data: { emailSent: false, emailError: sendResult.error || "Failed to send approval email" } }, { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error("Approval email error:", err);
    return Response.json({ success: false, error: String(err) }, { status: 500, headers: CORS_HEADERS });
  }
});
