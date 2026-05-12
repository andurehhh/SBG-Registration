// backend/src/routes/admin/termReset.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import db from "../../lib/db";

export const adminTermResetRouter = Router();

adminTermResetRouter.use(requireAuth);

// POST /api/admin/term-reset
// Marks all approved members as inactive, requiring re-registration for the new term
adminTermResetRouter.post("/", async (_req, res) => {
  try {
    const result = await db.member.updateMany({
      where: { status: "approved" },
      data: { status: "inactive" },
    });

    res.json({
      success: true,
      data: {
        deactivated: result.count,
        message: `${result.count} member${result.count !== 1 ? "s" : ""} marked as inactive for the new term.`,
      },
    });
  } catch (error) {
    console.error("Term reset error:", error);
    res.status(500).json({ success: false, error: "Failed to reset term" });
  }
});
