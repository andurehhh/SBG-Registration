import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  // 5 term resets per IP per hour (should almost never be hit)
  if (isRateLimited(getClientIp(req), 5, 60 * 60 * 1000)) return rateLimitedResponse();

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ success: false, error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });

    const { data, error } = await supabase.from("Member").update({ status: "inactive" }).eq("status", "approved").select("id");
    if (error) throw error;

    const count = data?.length ?? 0;
    return Response.json({
      success: true,
      data: { deactivated: count, message: `${count} member${count !== 1 ? "s" : ""} marked as inactive.` },
    }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Term reset error:", err);
    return Response.json({ success: false, error: "Failed to reset term" }, { status: 500, headers: CORS_HEADERS });
  }
});
