// backend/src/routes/admin/stats.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import db from "../../lib/db";

export const adminStatsRouter = Router();

adminStatsRouter.use(requireAuth);

// GET /api/admin/stats?school_year=2025-2026
// If school_year is omitted, returns all-time stats.
// Also returns GET /api/admin/stats/school-years — list of distinct school years.
adminStatsRouter.get("/school-years", async (_req, res) => {
  try {
    // Get all distinct school_year values that have at least one approved member
    const rows = await db.member.findMany({
      where: { school_year: { not: null } },
      select: { school_year: true },
      distinct: ["school_year"],
      orderBy: { school_year: "desc" },
    });
    const years = rows
      .map((r) => r.school_year)
      .filter((y): y is string => y !== null);
    res.json({ success: true, data: years });
  } catch (error) {
    console.error("School years error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch school years" });
  }
});

adminStatsRouter.get("/", async (req, res) => {
  try {
    const { school_year } = req.query as { school_year?: string };

    // Base where clause — scoped to school year if provided
    const termWhere = school_year ? { school_year } : {};

    const [
      statusCounts,
      byCourse,
      byYearLevel,
      byGender,
    ] = await Promise.all([
      // Status counts scoped to the term
      db.member.groupBy({
        by: ["status"],
        where: termWhere,
        _count: { _all: true },
      }),
      // Breakdowns only for approved members in the term
      db.member.groupBy({
        by: ["course"],
        where: { ...termWhere, status: "approved", course: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { course: "desc" } },
      }),
      db.member.groupBy({
        by: ["year_level"],
        where: { ...termWhere, status: "approved" },
        _count: { _all: true },
        orderBy: { year_level: "asc" },
      }),
      db.member.groupBy({
        by: ["gender"],
        where: { ...termWhere, status: "approved", gender: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    let total = 0;
    for (const row of statusCounts) {
      statusMap[row.status] = row._count._all;
      total += row._count._all;
    }

    res.json({
      success: true,
      data: {
        school_year: school_year ?? null,
        total,
        pending: statusMap["pending"] ?? 0,
        approved: statusMap["approved"] ?? 0,
        rejected: statusMap["rejected"] ?? 0,
        inactive: statusMap["inactive"] ?? 0,
        removed: statusMap["removed"] ?? 0,
        byCourse: byCourse.map((r) => ({
          course: r.course ?? "Unknown",
          count: r._count._all,
        })),
        byYearLevel: byYearLevel.map((r) => ({
          year: r.year_level,
          count: r._count._all,
        })),
        byGender: byGender.map((r) => ({
          gender: r.gender ?? "Unknown",
          count: r._count._all,
        })),
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
});
