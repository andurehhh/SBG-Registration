import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateEmailHTML } from "../_shared/emailTemplate.ts";

async function sendEmailViaLambda(
  to: string,
  subject: string,
  html: string,
  fromEmail: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const lambdaUrl = Deno.env.get("LAMBDA_EMAIL_ENDPOINT");
    const apiKey = Deno.env.get("LAMBDA_API_KEY");

    if (!lambdaUrl || !apiKey) {
      return { success: false, error: "Missing Lambda environment variables" };
    }

    const response = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        from: fromEmail,
        from_email: fromEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Lambda email error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: String(err) };
  }
}

Deno.serve(async (req) => {
  try {
    const { record } = await req.json();
    
    if (!record?.email || !record?.full_name) {
      console.error("Missing email or name in record");
      return Response.json({ success: false }, { status: 400 });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const fromEmail = Deno.env.get("GMAIL_ADDRESS")!;

    const appUrl = Deno.env.get("APP_URL") || "https://sbg-pupbinan.vercel.app";
    const hasCor = !!record.cor_url;

    const corNote = hasCor
      ? ''
      : `\n\nIf you haven't submitted your COR yet, you can upload it here: <a href="${appUrl}/submit-cor">${appUrl}/submit-cor</a>`;

    const html = generateEmailHTML({
      recipientName: record.full_name,
      body: `Your membership application to the <b>AWS Student Builder Group – PUP Biñan</b> has been successfully received.\n\nOur team will review the information and documents you submitted. You will receive another email once a decision has been made regarding your application.${corNote}\n\nPlease keep your email accessible and check your inbox regularly for updates.\n\nThank you for your interest in becoming part of our community.`,
      heading: "Application Received",
      signature: "Best regards,\nAWS Student Builder Group – PUP Biñan",
    });

    const { data: queuedEmail, error: insertError } = await supabase
      .from("EmailQueue")
      .insert({
        to: record.email,
        subject: "Application Received – SBG PUP Biñan",
        html,
        from_email: fromEmail,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Queue insert error:", insertError);
      return Response.json({ success: false, error: insertError.message }, { status: 500 });
    }

    const { error: processingError } = await supabase
      .from("EmailQueue")
      .update({ status: "processing" })
      .eq("id", queuedEmail.id);

    if (processingError) {
      console.error("Queue processing error:", processingError);
    }

    const sendResult = await sendEmailViaLambda(record.email, "Application Received – SBG PUP Biñan", html, fromEmail);

    if (sendResult.success) {
      const { error: sentError } = await supabase
        .from("EmailQueue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", queuedEmail.id);

      if (sentError) {
        console.error("Failed to mark email as sent:", sentError);
        return Response.json({ success: false, error: sentError.message }, { status: 500 });
      }

      return Response.json({ success: true, data: { emailSent: true } });
    }

    const { error: failedError } = await supabase
      .from("EmailQueue")
      .update({
        status: "failed",
        error: sendResult.error || "Unknown email error",
        retry_count: 1,
      })
      .eq("id", queuedEmail.id);

    if (failedError) {
      console.error("Failed to mark email as failed:", failedError);
    }

    return Response.json({
      success: true,
      data: {
        emailSent: false,
        emailError: sendResult.error || "Failed to send registration confirmation",
      },
    });
  } catch (err) {
    console.error("Registration confirmation error:", err);
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
});
