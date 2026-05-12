// backend/src/routes/admin/announcements.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { announcementSchema } from "../../lib/validations";
import { mailService } from "../../services/mail";
import db from "../../lib/db";
import type { AnnouncementData } from "../../lib/validations";

export const adminAnnouncementsRouter = Router();

adminAnnouncementsRouter.use(requireAuth);

// POST /api/admin/announcements/send
adminAnnouncementsRouter.post("/send", validateBody(announcementSchema), async (req, res) => {
  try {
    const { subject, body, signature, recipients } = req.body as AnnouncementData;

    // Resolve recipient list
    let memberQuery: Record<string, unknown> = {};

    if (recipients.type === "all") {
      // All members (any status)
      memberQuery = {};
    } else if (recipients.type === "group" && recipients.filters) {
      const filters = recipients.filters;
      if (filters.course) memberQuery["course"] = filters.course;
      if (filters.year_level) memberQuery["year_level"] = filters.year_level;
      if (filters.status) memberQuery["status"] = filters.status;
    } else if (recipients.type === "individual" && recipients.memberIds?.length) {
      memberQuery["id"] = { in: recipients.memberIds };
    }

    const members = await db.member.findMany({
      where: memberQuery,
      select: { id: true, email: true, full_name: true },
    });

    if (members.length === 0) {
      res.json({ success: true, data: { sent: 0, failed: [] } });
      return;
    }

    // Send emails and collect results
    const results = await Promise.allSettled(
      members.map((member) =>
        mailService.sendAnnouncement({
          toEmail: member.email,
          fullName: member.full_name,
          subject,
          body,
          signature: signature ?? "",
        })
      )
    );

    const failed: { email: string; error: string }[] = [];
    let sent = 0;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed.push({
          email: members[index]!.email,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
      }
    });

    const statusCode = failed.length > 0 ? 207 : 200;
    res.status(statusCode).json({
      success: true,
      data: { sent, failed },
    });
  } catch (error) {
    console.error("Announcement send error:", error);
    res.status(500).json({ success: false, error: "Failed to send announcement" });
  }
});
