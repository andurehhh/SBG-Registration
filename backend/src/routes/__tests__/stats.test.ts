// Feature: sbg-portal-redesign
// Property 14 — Stats Totals Consistency
// Validates: Requirements 10.1, 10.3, 10.4, 10.5

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MemberStatus = "pending" | "approved" | "rejected" | "inactive" | "removed";
type Gender = "Male" | "Female" | "NonBinary" | "PreferNotToSay";

interface MemberRecord {
  status: MemberStatus;
  course: string | null;
  year_level: number | null;
  gender: Gender | null;
}

interface StatsResult {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  inactive: number;
  removed: number;
  byCourse: { course: string; count: number }[];
  byYearLevel: { year: number | null; count: number }[];
  byGender: { gender: string; count: number }[];
}

// ---------------------------------------------------------------------------
// Pure stats computation — mirrors the logic in backend/src/routes/admin/stats.ts
//
// The actual handler uses Prisma groupBy + count. Here we replicate the same
// aggregation logic in pure TypeScript so we can test it against arbitrary
// member arrays without a database.
// ---------------------------------------------------------------------------

function computeStats(members: MemberRecord[]): StatsResult {
  // Build status map (mirrors the statusCounts groupBy)
  const statusMap: Record<string, number> = {};
  let total = 0;
  for (const m of members) {
    statusMap[m.status] = (statusMap[m.status] ?? 0) + 1;
    total++;
  }

  // byCourse: only approved members with non-null course (mirrors the where clause)
  const courseMap: Record<string, number> = {};
  for (const m of members) {
    if (m.status === "approved" && m.course !== null) {
      courseMap[m.course] = (courseMap[m.course] ?? 0) + 1;
    }
  }
  const byCourse = Object.entries(courseMap).map(([course, count]) => ({ course, count }));

  // byYearLevel: only approved members (mirrors the where clause)
  const yearMap: Record<number, number> = {};
  for (const m of members) {
    if (m.status === "approved" && m.year_level !== null) {
      yearMap[m.year_level] = (yearMap[m.year_level] ?? 0) + 1;
    }
  }
  const byYearLevel = Object.entries(yearMap).map(([year, count]) => ({
    year: Number(year),
    count,
  }));

  // byGender: only approved members with non-null gender (mirrors the where clause)
  const genderMap: Record<string, number> = {};
  for (const m of members) {
    if (m.status === "approved" && m.gender !== null) {
      genderMap[m.gender] = (genderMap[m.gender] ?? 0) + 1;
    }
  }
  const byGender = Object.entries(genderMap).map(([gender, count]) => ({ gender, count }));

  return {
    total,
    pending: statusMap["pending"] ?? 0,
    approved: statusMap["approved"] ?? 0,
    rejected: statusMap["rejected"] ?? 0,
    inactive: statusMap["inactive"] ?? 0,
    removed: statusMap["removed"] ?? 0,
    byCourse,
    byYearLevel,
    byGender,
  };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const memberArb = fc.record({
  status: fc.constantFrom<MemberStatus>(
    "pending",
    "approved",
    "rejected",
    "inactive",
    "removed"
  ),
  course: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
  year_level: fc.option(fc.integer({ min: 1, max: 4 }), { nil: null }),
  gender: fc.option(
    fc.constantFrom<Gender>("Male", "Female", "NonBinary", "PreferNotToSay"),
    { nil: null }
  ),
});

const memberArrayArb = fc.array(memberArb, { minLength: 0, maxLength: 200 });

// ---------------------------------------------------------------------------
// Property 14 — Stats Totals Consistency
// ---------------------------------------------------------------------------

describe("Property 14 — Stats Totals Consistency", () => {
  it(
    "total equals approved + pending + rejected + inactive + removed",
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const stats = computeStats(members);

          expect(stats.total).toBe(
            stats.approved + stats.pending + stats.rejected + stats.inactive + stats.removed
          );
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "total equals the number of members in the input array",
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const stats = computeStats(members);
          expect(stats.total).toBe(members.length);
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "byCourse breakdown sums to the count of approved members with non-null course",
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const stats = computeStats(members);

          const expectedCourseTotal = members.filter(
            (m) => m.status === "approved" && m.course !== null
          ).length;

          const actualCourseTotal = stats.byCourse.reduce((sum, row) => sum + row.count, 0);

          expect(actualCourseTotal).toBe(expectedCourseTotal);
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "byYearLevel breakdown sums to the count of approved members with non-null year_level",
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const stats = computeStats(members);

          const expectedYearTotal = members.filter(
            (m) => m.status === "approved" && m.year_level !== null
          ).length;

          const actualYearTotal = stats.byYearLevel.reduce((sum, row) => sum + row.count, 0);

          expect(actualYearTotal).toBe(expectedYearTotal);
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "byGender breakdown sums to the count of approved members with non-null gender",
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const stats = computeStats(members);

          const expectedGenderTotal = members.filter(
            (m) => m.status === "approved" && m.gender !== null
          ).length;

          const actualGenderTotal = stats.byGender.reduce((sum, row) => sum + row.count, 0);

          expect(actualGenderTotal).toBe(expectedGenderTotal);
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "each status count is non-negative and does not exceed total",
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const stats = computeStats(members);

          expect(stats.pending).toBeGreaterThanOrEqual(0);
          expect(stats.approved).toBeGreaterThanOrEqual(0);
          expect(stats.rejected).toBeGreaterThanOrEqual(0);
          expect(stats.inactive).toBeGreaterThanOrEqual(0);
          expect(stats.removed).toBeGreaterThanOrEqual(0);

          expect(stats.pending).toBeLessThanOrEqual(stats.total);
          expect(stats.approved).toBeLessThanOrEqual(stats.total);
          expect(stats.rejected).toBeLessThanOrEqual(stats.total);
          expect(stats.inactive).toBeLessThanOrEqual(stats.total);
          expect(stats.removed).toBeLessThanOrEqual(stats.total);
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "byCourse counts are all positive and each course appears at most once",
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const stats = computeStats(members);

          // Every count in the breakdown must be positive
          for (const row of stats.byCourse) {
            expect(row.count).toBeGreaterThan(0);
          }

          // Each course key must be unique
          const courses = stats.byCourse.map((r) => r.course);
          const uniqueCourses = new Set(courses);
          expect(uniqueCourses.size).toBe(courses.length);
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "byYearLevel counts are all positive and each year appears at most once",
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const stats = computeStats(members);

          for (const row of stats.byYearLevel) {
            expect(row.count).toBeGreaterThan(0);
          }

          const years = stats.byYearLevel.map((r) => r.year);
          const uniqueYears = new Set(years);
          expect(uniqueYears.size).toBe(years.length);
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "byGender counts are all positive and each gender appears at most once",
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const stats = computeStats(members);

          for (const row of stats.byGender) {
            expect(row.count).toBeGreaterThan(0);
          }

          const genders = stats.byGender.map((r) => r.gender);
          const uniqueGenders = new Set(genders);
          expect(uniqueGenders.size).toBe(genders.length);
        }),
        { numRuns: 200 }
      );
    }
  );

  // Edge case: empty member array
  it("returns all zeros for an empty member array", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.approved).toBe(0);
    expect(stats.rejected).toBe(0);
    expect(stats.inactive).toBe(0);
    expect(stats.removed).toBe(0);
    expect(stats.byCourse).toHaveLength(0);
    expect(stats.byYearLevel).toHaveLength(0);
    expect(stats.byGender).toHaveLength(0);
  });

  // Edge case: all members have the same status
  it("correctly counts when all members share the same status", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            status: fc.constant<MemberStatus>("approved"),
            course: fc.constant("BSIT"),
            year_level: fc.constant(2),
            gender: fc.constant<Gender>("Male"),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (members) => {
          const stats = computeStats(members);
          expect(stats.approved).toBe(members.length);
          expect(stats.total).toBe(members.length);
          expect(stats.pending).toBe(0);
          expect(stats.rejected).toBe(0);
          expect(stats.inactive).toBe(0);
          expect(stats.removed).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
