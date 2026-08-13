import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isRateLimited, getClientIp, CORS_HEADERS, corsResponse, rateLimitedResponse } from "../_shared/rateLimiter.ts";
import { generateEmailHTML } from "../_shared/emailTemplate.ts";
import { sendEmailViaLambda } from "../_shared/emailSender.ts";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 1 * 1024 * 1024;

// Update this to your production frontend URL
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://sbg-pupbinan.vercel.app";

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

  // 5 requests per IP per 10 minutes
  if (isRateLimited(getClientIp(req), 5, 10 * 60 * 1000)) return rateLimitedResponse();

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const formData = await req.formData();
    const corFile = formData.get("cor_file") as File | null;
    const proofFile = formData.get("proof_of_share_file") as File | null;

    // Check if COR is required from app_settings
    const { data: appSettings } = await supabase
      .from("app_settings")
      .select("cor_required")
      .eq("id", "default")
      .single();

    const corRequired = appSettings?.cor_required ?? false;

    if (corRequired && !corFile) {
      return Response.json(
        { success: false, error: "COR file is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    if (!proofFile) {
      return Response.json(
        { success: false, error: "Proof of Share file is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Validate file types/sizes for files that exist
    const filesToValidate: File[] = [proofFile];
    if (corFile) filesToValidate.unshift(corFile);

    for (const file of filesToValidate) {
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

    // Upload files — COR only if provided
    const [corUrl, proofUrl] = await Promise.all([
      corFile
        ? uploadToCloudinary(await corFile.arrayBuffer(), corFile.type, `sbg_uploads/${safeStudentNumber}_cor_${timestamp}`)
        : Promise.resolve(null),
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

    // Build email body — include COR submission link if COR was not provided
    const fullName = sanitize(formData.get("full_name") as string);
    let emailBody = `Thank you for your application to the Student Builder Group (SBG)!

We have received your registration and are currently reviewing your application. You will be notified as soon as we complete our review process.`;

    if (!corFile) {
      emailBody += `

<strong>Important: Submit your COR</strong>

We noticed you registered without uploading your Certificate of Registration (COR). Once you have your COR available, please submit it using the link below:

<a href="${FRONTEND_URL}/submit-cor" style="display:inline-block;padding:10px 20px;background:#7C3AED;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;margin:12px 0;">Submit Your COR</a>

You will need your student number (<strong>${sanitize(studentNumber)}</strong>) to submit.`;
    }

    emailBody += `

In the meantime, if you have any questions, feel free to reach out to us.`;

    const fromEmail = Deno.env.get("GMAIL_ADDRESS")!;
    const html = generateEmailHTML({
      recipientName: fullName,
      body: emailBody,
      signature: "Best regards,\nStudent Builder Group\nPUP Biñan Campus",
    });

    const { data: queuedEmail, error: queueError } = await supabase
      .from("EmailQueue")
      .insert({
        to: formData.get("email") as string,
        subject: "Application Received – SBG PUP Biñan",
        html,
        from_email: fromEmail,
        status: "pending",
      })
      .select("id")
      .single();

    let emailSent = false;
    let emailError: string | undefined;

    if (queueError || !queuedEmail) {
      emailError = queueError?.message || "Failed to queue email";
      console.error("Queue insert error:", emailError);
    } else {
      await supabase.from("EmailQueue").update({ status: "processing" }).eq("id", queuedEmail.id);

      const sendResult = await sendEmailViaLambda(
        formData.get("email") as string,
        "Application Received – SBG PUP Biñan",
        html,
        fromEmail
      );

      if (sendResult.success) {
        emailSent = true;
        const { error: sentError } = await supabase
          .from("EmailQueue")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", queuedEmail.id);

        if (sentError) {
          console.error("Failed to mark registration email as sent:", sentError);
        }
      } else {
        emailError = sendResult.error || "Failed to send registration confirmation";
        await supabase.from("EmailQueue").update({
          status: "failed",
          error: emailError,
          retry_count: 1,
        }).eq("id", queuedEmail.id);
      }
    }

    return Response.json(
      { success: true, data: { id: member.id, emailSent, emailError } },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return Response.json({ success: false, error: err instanceof Error ? err.message : "Registration failed" }, { status: 500, headers: CORS_HEADERS });
  }
});
