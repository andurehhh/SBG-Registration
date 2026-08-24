import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

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

  // Rate limit: 5 requests per IP per 10 minutes
  if (isRateLimited(getClientIp(req), 20, 10 * 60 * 1000)) return rateLimitedResponse();

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const formData = await req.formData();

    const studentNumber = (formData.get("student_number") as string)?.trim();
    const corFile = formData.get("cor_file") as File | null;

    if (!studentNumber) {
      return Response.json({ success: false, error: "Student number is required" }, { status: 400, headers: CORS_HEADERS });
    }

    if (!corFile) {
      return Response.json({ success: false, error: "COR file is required" }, { status: 400, headers: CORS_HEADERS });
    }

    // Validate file
    if (!ALLOWED_MIME_TYPES.includes(corFile.type)) {
      return Response.json({ success: false, error: "Invalid file type. Only JPEG, PNG, and PDF are allowed." }, { status: 400, headers: CORS_HEADERS });
    }
    if (corFile.size > MAX_FILE_SIZE) {
      return Response.json({ success: false, error: "File too large. Maximum size is 1MB." }, { status: 400, headers: CORS_HEADERS });
    }

    // Check if member exists, is pending, and has no COR
    const { data: member, error: memberError } = await supabase
      .from("Member")
      .select("id, student_number, full_name, cor_url, status")
      .eq("student_number", studentNumber)
      .single();

    if (memberError || !member) {
      return Response.json({ success: false, error: "No application found for this student number." }, { status: 404, headers: CORS_HEADERS });
    }

    if (member.status !== "pending") {
      return Response.json({ success: false, error: "This application has already been processed." }, { status: 400, headers: CORS_HEADERS });
    }

    if (member.cor_url) {
      return Response.json({ success: false, error: "COR has already been submitted for this application." }, { status: 400, headers: CORS_HEADERS });
    }

    // Upload to Cloudinary
    const fileBuffer = await corFile.arrayBuffer();
    const publicId = `sbg-cor/${member.id}`;
    const corUrl = await uploadToCloudinary(fileBuffer, corFile.type, publicId);

    // Update member record
    const { error: updateError } = await supabase
      .from("Member")
      .update({ cor_url: corUrl })
      .eq("id", member.id);

    if (updateError) {
      return Response.json({ success: false, error: "Failed to save COR. Please try again." }, { status: 500, headers: CORS_HEADERS });
    }

    return Response.json(
      { success: true, data: { name: member.full_name } },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("submit-cor error:", err);
    return Response.json({ success: false, error: "An unexpected error occurred." }, { status: 500, headers: CORS_HEADERS });
  }
});
