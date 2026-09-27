import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";

// Soft-delete a member: sets status to "removed". The record is kept for
// history/audit; RLS blocks direct writes from the admin frontend, so this
// runs under the service role after verifying the caller's admin JWT.
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
    if (!id) return Response.json({ success: false, error: "Member id is required" }, { status: 400, headers: CORS_HEADERS });

    const { data: member, error } = await supabase.from("Member").select("id, status").eq("id", id).single();
    if (error || !member) return Response.json({ success: false, error: "Member not found" }, { status: 404, headers: CORS_HEADERS });

    if (member.status === "removed") {
      return Response.json({ success: false, error: "Member is already removed" }, { status: 400, headers: CORS_HEADERS });
    }

    const { data: updated, error: updateError } = await supabase
      .from("Member")
      .update({ status: "removed" })
      .eq("id", id)
      .select()
      .single();
    if (updateError) throw updateError;

    return Response.json({ success: true, data: updated }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Remove member error:", err);
    return Response.json({ success: false, error: "Failed to remove member" }, { status: 500, headers: CORS_HEADERS });
  }
});
