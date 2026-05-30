import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function sendEmailViaLambda(
  to: string,
  subject: string,
  html: string,
  fromEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const lambdaUrl = Deno.env.get("LAMBDA_EMAIL_ENDPOINT")!;
    const apiKey = Deno.env.get("LAMBDA_API_KEY")!;

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
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get up to 5 pending emails from queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("EmailQueue")
      .select("*")
      .eq("status", "pending")
      .lt("retry_count", 3)
      .order("created_at", { ascending: true })
      .limit(5);

    if (fetchError) {
      console.error("Error fetching pending emails:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500 }
      );
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No pending emails" }),
        { status: 200 }
      );
    }

    console.log(`Processing ${pendingEmails.length} emails from queue`);

    // Process each email with a delay
    let processed = 0;
    for (const email of pendingEmails) {
      try {
        const { success, error } = await sendEmailViaLambda(
          email.to,
          email.subject,
          email.html,
          email.from_email
        );

        if (success) {
          // Update status to sent
          await supabase
            .from("EmailQueue")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", email.id);

          processed++;
          console.log(`Email sent to ${email.to}`);
        } else {
          // Increment retry count
          await supabase
            .from("EmailQueue")
            .update({
              status: "failed",
              error: error || "Unknown error",
              retry_count: email.retry_count + 1,
            })
            .eq("id", email.id);

          console.error(`Failed to send to ${email.to}: ${error}`);
        }
      } catch (err) {
        console.error(`Error processing email ${email.id}:`, err);
        await supabase
          .from("EmailQueue")
          .update({
            status: "failed",
            error: String(err),
            retry_count: email.retry_count + 1,
          })
          .eq("id", email.id);
      }

      // Add 100ms delay between emails to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        message: `Processed ${processed}/${pendingEmails.length} emails`,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Queue processor error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
