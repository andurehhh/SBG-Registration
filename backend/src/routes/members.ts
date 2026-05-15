// backend/src/routes/members.ts
import { Router } from "express";
import multer from "multer";
import { idFinderLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../middleware/validate";
import { registrationBodySchema } from "../lib/validations";
import { sanitize } from "../lib/utils";
import { driveService } from "../services/drive";
import db, { withRetry } from "../lib/db";

export const membersRouter = Router();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and PDF are allowed.`));
    }
  },
});

// POST /api/members/register
membersRouter.post(
  "/register",
  upload.fields([
    { name: "cor_file", maxCount: 1 },
    { name: "proof_of_share_file", maxCount: 1 },
  ]),
  validateBody(registrationBodySchema),
  async (req, res) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const corFile = files?.["cor_file"]?.[0];
      const proofFile = files?.["proof_of_share_file"]?.[0];

      if (!corFile) {
        res.status(400).json({ success: false, error: "COR file is required" });
        return;
      }
      if (!proofFile) {
        res.status(400).json({ success: false, error: "Proof of Share file is required" });
        return;
      }

      const body = req.body as {
        full_name: string;
        student_number: string;
        course: string;
        year_level: number;
        section: string;
        email: string;
        scholar_email: string;
        gender: "Male" | "Female" | "NonBinary" | "PreferNotToSay";
        skills: string[];
        why_join: string;
        expectations: string;
      };

      // Check for duplicate student number
      // Allow re-registration if previous record is inactive or rejected
      const existing = await withRetry(() => db.member.findUnique({
        where: { student_number: body.student_number },
        select: { id: true, status: true },
      }));

      if (existing) {
        if (existing.status === "pending" || existing.status === "approved") {
          res.status(409).json({
            success: false,
            error: existing.status === "pending"
              ? "This student number already has a pending application"
              : "This student number already has an active membership",
          });
          return;
        }
        // inactive or rejected — delete old record so they can re-register fresh
        await withRetry(() => db.member.delete({ where: { id: existing.id } }));
      }

      // Upload files to Google Drive
      const [corResult, proofResult] = await Promise.all([
        driveService.upload({
          fileBuffer: corFile.buffer,
          mimeType: corFile.mimetype,
          studentNumber: body.student_number,
          documentType: "cor",
        }),
        driveService.upload({
          fileBuffer: proofFile.buffer,
          mimeType: proofFile.mimetype,
          studentNumber: body.student_number,
          documentType: "proof_of_share",
        }),
      ]);

      // Sanitize text inputs
      const member = await withRetry(() => db.member.create({
        data: {
          full_name: sanitize(body.full_name),
          student_number: body.student_number,
          course: sanitize(body.course),
          year_level: body.year_level,
          section: sanitize(body.section),
          email: body.email,
          scholar_email: body.scholar_email,
          gender: body.gender,
          skills: body.skills,
          why_join: sanitize(body.why_join),
          expectations: sanitize(body.expectations),
          cor_url: corResult.shareableUrl,
          proof_of_share_url: proofResult.shareableUrl,
          status: "pending",
        },
        select: { id: true },
      }));

      res.status(201).json({ success: true, data: { id: member.id } });
    } catch (error) {
      console.error("Registration error:", error);
      const message = error instanceof Error ? error.message : "Registration failed";
      res.status(500).json({ success: false, error: message });
    }
  }
);

// GET /api/members/lookup?student_number=
membersRouter.get("/lookup", idFinderLimiter, async (req, res) => {
  const studentNumber = req.query["student_number"] as string | undefined;

  if (!studentNumber) {
    res.status(400).json({ success: false, error: "student_number query parameter is required" });
    return;
  }

  try {
    const member = await db.member.findUnique({
      where: { student_number: studentNumber },
      select: {
        id: true,
        full_name: true,
        sbg_id: true,
        course: true,
        year_level: true,
        section: true,
        school_year: true,
        skills: true,
        sticker_id: true,
        status: true,
        created_at: true,
      },
    });

    if (!member) {
      res.status(404).json({ success: false, error: "not_found" });
      return;
    }

    if (member.status !== "approved") {
      res.status(200).json({ success: false, error: member.status });
      return;
    }

    res.json({
      success: true,
      data: {
        id: member.id,
        full_name: member.full_name,
        sbg_id: member.sbg_id,
        course: member.course,
        year_level: member.year_level,
        section: member.section,
        school_year: member.school_year,
        skills: member.skills,
        sticker_id: member.sticker_id,
        created_at: member.created_at.toISOString(),
      },
    });
  } catch (error) {
    console.error("Lookup error:", error);
    res.status(500).json({ success: false, error: "Lookup failed" });
  }
});
