import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateEmailHTML } from "../_shared/emailTemplate.ts";

Deno.serve(async (req) => {
  try {
    const { record } = await req.json();
    
    if (!record?.email || !record?.full_name) {
      console.error("Missing email or name in record");
      return Response.json({ success: false }, { status: 400 });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const fromEmail = Deno.env.get("GMAIL_ADDRESS")!;

    const html = generateEmailHTML({
      recipientName: record.full_name,
      body: `Thank you for your application to the Student Builder Group (SBG)!\n\nWe have received your registration and are currently reviewing your application. You will be notified as soon as we complete our review process.\n\nIn the meantime, if you have any questions, feel free to reach out to us.`,
      signature: "Best regards,\nStudent Builder Group\nPUP Biñan Campus",
    });

    const { error: insertError } = await supabase
      .from("EmailQueue")
      .insert({
        to: record.email,
        subject: "Application Received – SBG PUP Biñan",
        html,
        from_email: fromEmail,
        status: "pending",
      });

    if (insertError) {
      console.error("Queue insert error:", insertError);
      return Response.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Registration confirmation error:", err);
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
});
