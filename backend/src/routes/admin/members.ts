// backend/src/routes/admin/members.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { generateUniqueSbgId } from "../../services/sbgId";
import { mailService } from "../../services/mail";
import { formatSchoolYear } from "../../lib/utils";
import db from "../../lib/db";

export const adminMembersRouter = Router();

// All routes require auth
adminMembersRouter.use(requireAuth);

// GET /api/admin/members
adminMembersRouter.get("/", async (req, res) => {
  try {
    const {
      status,
      course,
      year_level,
      gender,
      skills,
      sort = "created_at_desc",
      page = "1",
      limit = "50",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status) where["status"] = status;
    if (course) where["course"] = course;
    if (year_level) where["year_level"] = parseInt(year_level, 10);
    if (gender) where["gender"] = gender;
    if (skills) {
      const skillList = skills.split(",").filter(Boolean);
      if (skillList.length > 0) {
        where["skills"] = { hasSome: skillList };
      }
    }

    // Build orderBy
    const orderByMap: Record<string, unknown> = {
      created_at_asc: { created_at: "asc" },
      created_at_desc: { created_at: "desc" },
      status: { status: "asc" },
      year_level: { year_level: "asc" },
    };
    const orderBy = orderByMap[sort] ?? { created_at: "desc" };

    const [members, total] = await Promise.all([
      db.member.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      }),
      db.member.count({ where }),
    ]);

    res.json({
      success: true,
      data: members,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Admin members list error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch members" });
  }
});

// GET /api/admin/members/:id
adminMembersRouter.get("/:id", async (req, res) => {
  try {
    const member = await db.member.findUnique({
      where: { id: req.params["id"] },
    });

    if (!member) {
      res.status(404).json({ success: false, error: "Member not found" });
      return;
    }

    res.json({ success: true, data: member });
  } catch (error) {
    console.error("Admin member detail error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch member" });
  }
});

// POST /api/admin/members/:id/approve
adminMembersRouter.post("/:id/approve", async (req, res) => {
  try {
    const member = await db.member.findUnique({
      where: { id: req.params["id"] },
    });

    if (!member) {
      res.status(404).json({ success: false, error: "Member not found" });
      return;
    }

    if (member.status !== "pending") {
      res.status(400).json({ success: false, error: "Member is not in pending status" });
      return;
    }

    const registrationYear = member.created_at.getFullYear();
    const sbgId = await generateUniqueSbgId(db, registrationYear);
    const schoolYear = formatSchoolYear(member.created_at);

    const updated = await db.member.update({
      where: { id: member.id },
      data: {
        status: "approved",
        sbg_id: sbgId,
        school_year: schoolYear,
      },
    });

    // Send welcome email (non-blocking — don't fail approval if email fails)
    mailService
      .sendWelcome({
        toEmail: member.email,
        fullName: member.full_name,
        sbgId,
        studentNumber: member.student_number,
      })
      .catch((err: unknown) => {
        console.error("Failed to send welcome email:", err);
      });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ success: false, error: "Failed to approve member" });
  }
});

// POST /api/admin/members/:id/reject
adminMembersRouter.post("/:id/reject", async (req, res) => {
  try {
    const member = await db.member.findUnique({
      where: { id: req.params["id"] },
    });

    if (!member) {
      res.status(404).json({ success: false, error: "Member not found" });
      return;
    }

    if (member.status !== "pending") {
      res.status(400).json({ success: false, error: "Member is not in pending status" });
      return;
    }

    const updated = await db.member.update({
      where: { id: member.id },
      data: { status: "rejected" },
    });

    // Send rejection email (non-blocking)
    mailService
      .sendRejection({
        toEmail: member.email,
        fullName: member.full_name,
      })
      .catch((err: unknown) => {
        console.error("Failed to send rejection email:", err);
      });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ success: false, error: "Failed to reject member" });
  }
});
