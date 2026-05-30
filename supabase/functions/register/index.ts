import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 1 * 1024 * 1024;

function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

async function uploadToCloudinary(fileBuffer: ArrayBuffer, mimeType: string, publicId: string): Promise<string> {
  const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
  const apiKey = Deno.env.get("CLOUDINARY_API_KEY")!;
  const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET")!;
  
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const resourceType = mimeType === "application/pdf" ? "raw" : "image";
  
  // Cloudinary signature: SHA-1 of "param1=value1&param2=value2...{api_secret}"
  // Parameters must be sorted alphabetically by key
  const paramsToSign = `public_id=${publicId}&resource_type=${resourceType}&timestamp=${timestamp}${apiSecret}`;
  
  // Calculate SHA-1 digest (NOT HMAC)
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

  // 5 requests per IP per 10 minutes
  if (isRateLimited(getClientIp(req), 5, 10 * 60 * 1000)) return rateLimitedResponse();

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const formData = await req.formData();
    const corFile = formData.get("cor_file") as File | null;
    const proofFile = formData.get("proof_of_share_file") as File | null;

    if (!corFile) return Response.json({ success: false, error: "COR file is required" }, { status: 400, headers: CORS_HEADERS });
    if (!proofFile) return Response.json({ success: false, error: "Proof of Share file is required" }, { status: 400, headers: CORS_HEADERS });

    for (const file of [corFile, proofFile]) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) return Response.json({ success: false, error: `Invalid file type: ${file.type}` }, { status: 400, headers: CORS_HEADERS });
      if (file.size > MAX_FILE_SIZE) return Response.json({ success: false, error: "File size must be under 1MB" }, { status: 400, headers: CORS_HEADERS });
    }

    const studentNumber = formData.get("student_number") as string;

    const { data: existing } = await supabase.from("Member").select("id, status").eq("student_number", studentNumber).single();
    if (existing) {
      if (existing.status === "pending" || existing.status === "approved") {
        return Response.json({
          success: false,
          error: existing.status === "pending" ? "This student number already has a pending application" : "This student number already has an active membership",
        }, { status: 409, headers: CORS_HEADERS });
      }
      await supabase.from("Member").delete().eq("id", existing.id);
    }

    const safeStudentNumber = studentNumber.replace(/[^a-zA-Z0-9]/g, "_");
    const timestamp = Date.now();
    const [corUrl, proofUrl] = await Promise.all([
      uploadToCloudinary(await corFile.arrayBuffer(), corFile.type, `sbg_uploads/${safeStudentNumber}_cor_${timestamp}`),
      uploadToCloudinary(await proofFile.arrayBuffer(), proofFile.type, `sbg_uploads/${safeStudentNumber}_proof_${timestamp}`),
    ]);

    const { data: member, error } = await supabase.from("Member").insert({
      full_name: sanitize(formData.get("full_name") as string),
      student_number: studentNumber,
      course: sanitize(formData.get("course") as string),
      year_level: parseInt(formData.get("year_level") as string, 10),
      section: sanitize(formData.get("section") as string),
      email: formData.get("email") as string,
      scholar_email: formData.get("scholar_email") as string,
      gender: formData.get("gender") as string,
      skills: formData.getAll("skills") as string[],
      why_join: sanitize(formData.get("why_join") as string),
      expectations: sanitize(formData.get("expectations") as string),
      cor_url: corUrl,
      proof_of_share_url: proofUrl,
      status: "pending",
    }).select("id").single();

    if (error) throw error;
    return Response.json({ success: true, data: { id: member.id } }, { status: 201, headers: CORS_HEADERS });
  } catch (err) {
    console.error("Registration error:", err);
    return Response.json({ success: false, error: err instanceof Error ? err.message : "Registration failed" }, { status: 500, headers: CORS_HEADERS });
  }
});
