import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  let record: Record<string, unknown> | null = null;

  try {
    const incomingSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
    if (!expectedSecret || incomingSecret !== expectedSecret) {
      console.error("Invalid or missing webhook secret");
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    record = body.record ?? body;
    
    if (!record?.to || !record?.html || !record?.id) {
      console.error("Missing required fields:", { to: record?.to, html: !!record?.html, id: record?.id });
      return Response.json({ success: false, error: "Missing email data" }, { status: 400 });
    }

    console.log(`Processing email for: ${record.to}`);

    // Initialize Supabase client for status updates
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Mark as processing immediately
    try {
      await supabase
        .from("EmailQueue")
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .eq("id", record.id);
    } catch (uErr) {
      console.error("Failed to mark processing:", uErr);
    }

    // Call Lambda to send email
    const lambdaUrl = Deno.env.get("LAMBDA_EMAIL_ENDPOINT");
    const apiKey = Deno.env.get("LAMBDA_API_KEY");
    
    if (!lambdaUrl || !apiKey) {
      const errMsg = `Missing environment variables: lambdaUrl=${!!lambdaUrl}, apiKey=${!!apiKey}`;
      console.error(errMsg);
      // update row as failed
      await supabase
        .from("EmailQueue")
        .update({ status: "failed", error: errMsg, retry_count: (record.retry_count || 0) + 1, updated_at: new Date().toISOString() })
        .eq("id", record.id);
      return Response.json({ success: false, error: errMsg }, { status: 500 });
    }

    let res, responseText;
    try {
      res = await fetch(lambdaUrl, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: record.to,
          subject: record.subject,
          html: record.html,
            from: record.from_email || "sbg.pupbinan@gmail.com",
            from_email: record.from_email || "sbg.pupbinan@gmail.com",
        }),
      });

      responseText = await res.text();
    } catch (callErr) {
      console.error("Lambda call failed:", callErr);
      // network error — mark pending for scheduled retry
      const newRetry = (record.retry_count || 0) + 1;
      const nextStatus = newRetry < 3 ? "pending" : "failed";
      await supabase
        .from("EmailQueue")
        .update({ status: nextStatus, error: String(callErr).substring(0, 500), retry_count: newRetry, updated_at: new Date().toISOString() })
        .eq("id", record.id);
      return Response.json({ success: false, error: String(callErr) }, { status: 500 });
    }

    if (!res.ok) {
      console.error(`Lambda returned ${res.status}: ${responseText}`);
      const newRetry = (record.retry_count || 0) + 1;
      const nextStatus = newRetry < 3 ? "pending" : "failed";
      await supabase
        .from("EmailQueue")
        .update({ status: nextStatus, error: responseText.substring(0, 500), retry_count: newRetry, updated_at: new Date().toISOString() })
        .eq("id", record.id);
      return Response.json({ success: false, error: responseText }, { status: 502 });
    }

    // Success — mark sent
    try {
      await supabase
        .from("EmailQueue")
        .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", record.id);
    } catch (uErr) {
      console.error("Failed to mark sent:", uErr);
      return Response.json({ success: false, error: String(uErr) }, { status: 500 });
    }

    console.log(`Email sent successfully to: ${record.to}`);
    return Response.json({ success: true, message: `Email sent to ${record.to}` });
  } catch (err) {
    console.error("Webhook error:", err);
    
    // Try to update status to failed with error message
    try {
      if (record?.id) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        
        await supabase
          .from("EmailQueue")
          .update({ 
            status: "failed",
            error: String(err).substring(0, 500),
            retry_count: ((record.retry_count as number) || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", record.id);
      }
    } catch (updateErr) {
      console.error("Failed to update error status:", updateErr);
    }
    
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
});
