const store = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= max) return true;
  entry.count++;
  return false;
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

export function corsResponse() {
  return new Response(null, { headers: CORS_HEADERS });
}

export function rateLimitedResponse() {
  return Response.json(
    { success: false, error: "Too many requests. Please try again later." },
    { status: 429, headers: CORS_HEADERS }
  );
}
