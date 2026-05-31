import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateEmailHTML } from "../_shared/emailTemplate.ts";
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
    const appUrl = Deno.env.get("APP_URL") || "https://sbg-registration.app";

    const html = generateEmailHTML({
      recipientName: member.full_name,
      body: `Congratulations! Your application to the Student Builder Group (SBG) has been approved!\n\nYou are now an official member of SBG PUP Biñan. You can now view and download your digital membership ID.\n\nVisit the portal to see your ID:\n${appUrl}/id-finder`,
      signature: "Welcome to the team!\nStudent Builder Group\nPUP Biñan Campus",
    });

    const { data: queuedEmail, error: insertError } = await supabase
      .from("EmailQueue")
      .insert({
        to: member.email,
        subject: "Welcome to SBG! Your Membership is Approved",
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
