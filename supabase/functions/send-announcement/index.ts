import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";
import { generateEmailHTML } from "../_shared/emailTemplate.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  // 10 announcement sends per IP per hour
  if (isRateLimited(getClientIp(req), 10, 60 * 60 * 1000)) return rateLimitedResponse();

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ success: false, error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });

    const { subject, body, signature, recipients } = await req.json();

    let query = supabase.from("Member").select("id, email, full_name");
    if (recipients.type === "group" && recipients.filters) {
      const f = recipients.filters;
      if (f.course) query = query.eq("course", f.course);
      if (f.year_level) query = query.eq("year_level", f.year_level);
      if (f.status) query = query.eq("status", f.status);
    } else if (recipients.type === "individual" && recipients.memberIds?.length) {
      query = query.in("id", recipients.memberIds);
    }

    const { data: members } = await query;
    if (!members?.length) return Response.json({ success: true, data: { queued: 0, failed: [] } }, { headers: CORS_HEADERS });

    const fromEmail = Deno.env.get("GMAIL_ADDRESS")!;

    // Insert all emails into queue instead of sending immediately
    const emailsToQueue = members.map((member) => {
      const html = generateEmailHTML({
        recipientName: member.full_name,
        body,
        signature,
      });
      
      return {
        to: member.email,
        subject,
        html,
        from_email: fromEmail,
        status: "pending",
      };
    });

    const { error: insertError } = await supabase
      .from("EmailQueue")
      .insert(emailsToQueue);

    if (insertError) {
      console.error("Queue insert error:", insertError);
      return Response.json(
        { success: false, error: insertError.message },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return Response.json(
      { success: true, data: { queued: emailsToQueue.length, failed: [] } }, 
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Announcement error:", err);
    return Response.json({ success: false, error: String(err) }, { status: 500, headers: CORS_HEADERS });
  }
});

