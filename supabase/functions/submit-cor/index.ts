import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 1 * 1024 * 1024;

async function uploadToCloudinary(fileBuffer: ArrayBuffer, mimeType: string, publicId: string): Promise<string> {
  const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
  const apiKey = Deno.env.get("CLOUDINARY_API_KEY")!;
  const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET")!;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const resourceType = mimeType === "application/pdf" ? "raw" : "image";

  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(paramsToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: mimeType }));
  form.append("public_id", publicId);
  form.append("timestamp", timestamp);
  form.append("api_key", apiKey);
  form.append("resource_type", resourceType);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`);
  return (await res.json()).secure_url as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  if (isRateLimited(getClientIp(req), 5, 10 * 60 * 1000)) return rateLimitedResponse();

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const formData = await req.formData();

    const studentNumber = formData.get("student_number") as string | null;
    const corFile = formData.get("cor_file") as File | null;

    if (!studentNumber || !studentNumber.trim()) {
      return Response.json(
        { success: false, error: "Student number is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!corFile) {
      return Response.json(
        { success: false, error: "COR file is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(corFile.type)) {
      return Response.json(
        { success: false, error: `Invalid file type: ${corFile.type}. Must be JPEG, PNG, or PDF.` },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (corFile.size > MAX_FILE_SIZE) {
      return Response.json(
        { success: false, error: "File size must be under 1 MB" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { data: member, error: findError } = await supabase
      .from("Member")
      .select("id, student_number, cor_url, status")
      .eq("student_number", studentNumber.trim())
      .single();

    if (findError || !member) {
      return Response.json(
        { success: false, error: "No application found for this student number. Please register first." },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    if (member.cor_url) {
      return Response.json(
        { success: false, error: "A COR has already been submitted for this student number." },
        { status: 409, headers: CORS_HEADERS }
      );
    }

    if (member.status === "rejected" || member.status === "removed") {
      return Response.json(
        { success: false, error: "Cannot submit COR for this application. Please contact the SBG team." },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const safeStudentNumber = studentNumber.trim().replace(/[^a-zA-Z0-9]/g, "_");
    const ts = Date.now();
    const corUrl = await uploadToCloudinary(
      await corFile.arrayBuffer(),
      corFile.type,
      `sbg_uploads/${safeStudentNumber}_cor_${ts}`
    );

    const { error: updateError } = await supabase
      .from("Member")
      .update({ cor_url: corUrl, updated_at: new Date().toISOString() })
      .eq("id", member.id);

    if (updateError) {
      throw updateError;
    }

    return Response.json(
      { success: true, data: { message: "COR submitted successfully" } },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Submit COR error:", err);
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to submit COR" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
