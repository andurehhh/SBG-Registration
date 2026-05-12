// Feature: sbg-portal-redesign
// Property 15 — Announcement Recipient Filter Correctness
// Validates: Requirements 11.3, 11.4

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ---------------------------------------------------------------------------
// Types — mirror the Prisma schema and announcement handler types
// ---------------------------------------------------------------------------

type MemberStatus = "pending" | "approved" | "rejected" | "inactive" | "removed";

interface Member {
  id: string;
  email: string;
  full_name: string;
  course: string | null;
  year_level: number | null;
  status: MemberStatus;
}

interface RecipientFilters {
  course?: string;
  year_level?: number;
  status?: MemberStatus;
}

type RecipientsConfig =
  | { type: "all" }
  | { type: "group"; filters: RecipientFilters }
  | { type: "individual"; memberIds: string[] };

// ---------------------------------------------------------------------------
// Pure recipient resolution — mirrors the logic in
// backend/src/routes/admin/announcements.ts (the memberQuery building block)
//
// The actual handler builds a Prisma `where` clause and calls db.member.findMany.
// Here we replicate the same filtering logic in pure TypeScript so we can test
// it against arbitrary member arrays without a database.
// ---------------------------------------------------------------------------

function resolveRecipients(members: Member[], recipients: RecipientsConfig): Member[] {
  if (recipients.type === "all") {
    // All members regardless of status
    return members;
  }

  if (recipients.type === "group") {
    const { filters } = recipients;
    return members.filter((m) => {
      if (filters.course !== undefined && m.course !== filters.course) return false;
      if (filters.year_level !== undefined && m.year_level !== filters.year_level) return false;
      if (filters.status !== undefined && m.status !== filters.status) return false;
      return true;
    });
  }

  if (recipients.type === "individual") {
    const idSet = new Set(recipients.memberIds);
    return members.filter((m) => idSet.has(m.id));
  }

  return [];
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const memberStatusArb = fc.constantFrom<MemberStatus>(
  "pending",
  "approved",
  "rejected",
  "inactive",
  "removed"
);

const courseArb = fc.constantFrom("BSIT", "BSCS", "BSIS", "BSCE", "BSEE");

const memberArb = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  full_name: fc.string({ minLength: 1, maxLength: 50 }),
  course: fc.option(courseArb, { nil: null }),
  year_level: fc.option(fc.integer({ min: 1, max: 4 }), { nil: null }),
  status: memberStatusArb,
});

const memberArrayArb = fc.array(memberArb, { minLength: 0, maxLength: 100 });

// ---------------------------------------------------------------------------
// Property 15 — Announcement Recipient Filter Correctness
// ---------------------------------------------------------------------------

describe("Property 15 — Announcement Recipient Filter Correctness", () => {
  // -------------------------------------------------------------------------
  // type = "all": every member is included
  // -------------------------------------------------------------------------
  it(
    'type="all" includes every member regardless of status, course, or year level',
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const result = resolveRecipients(members, { type: "all" });

          // All members must be present
          expect(result).toHaveLength(members.length);

          // Every member id in the input must appear in the result
          const resultIds = new Set(result.map((m) => m.id));
          for (const m of members) {
            expect(resultIds.has(m.id)).toBe(true);
          }
        }),
        { numRuns: 200 }
      );
    }
  );

  // -------------------------------------------------------------------------
  // type = "group" with course filter: only matching course members included
  // -------------------------------------------------------------------------
  it(
    'type="group" with course filter includes only members with matching course',
    () => {
      fc.assert(
        fc.property(memberArrayArb, courseArb, (members, course) => {
          const result = resolveRecipients(members, {
            type: "group",
            filters: { course },
          });

          // Every returned member must have the matching course
          for (const m of result) {
            expect(m.course).toBe(course);
          }

          // Every member with the matching course must be in the result
          const expectedIds = new Set(
            members.filter((m) => m.course === course).map((m) => m.id)
          );
          const resultIds = new Set(result.map((m) => m.id));
          for (const id of expectedIds) {
            expect(resultIds.has(id)).toBe(true);
          }

          // No member with a different course must appear
          for (const m of result) {
            expect(m.course).not.toBeNull();
          }
        }),
        { numRuns: 200 }
      );
    }
  );

  // -------------------------------------------------------------------------
  // type = "group" with status filter: only matching status members included
  // -------------------------------------------------------------------------
  it(
    'type="group" with status filter includes only members with matching status',
    () => {
      fc.assert(
        fc.property(memberArrayArb, memberStatusArb, (members, status) => {
          const result = resolveRecipients(members, {
            type: "group",
            filters: { status },
          });

          // Every returned member must have the matching status
          for (const m of result) {
            expect(m.status).toBe(status);
          }

          // Every member with the matching status must be in the result
          const expectedIds = new Set(
            members.filter((m) => m.status === status).map((m) => m.id)
          );
          const resultIds = new Set(result.map((m) => m.id));
          for (const id of expectedIds) {
            expect(resultIds.has(id)).toBe(true);
          }
        }),
        { numRuns: 200 }
      );
    }
  );

  // -------------------------------------------------------------------------
  // type = "group" with year_level filter: only matching year members included
  // -------------------------------------------------------------------------
  it(
    'type="group" with year_level filter includes only members with matching year_level',
    () => {
      fc.assert(
        fc.property(
          memberArrayArb,
          fc.integer({ min: 1, max: 4 }),
          (members, year_level) => {
            const result = resolveRecipients(members, {
              type: "group",
              filters: { year_level },
            });

            // Every returned member must have the matching year_level
            for (const m of result) {
              expect(m.year_level).toBe(year_level);
            }

            // Every member with the matching year_level must be in the result
            const expectedIds = new Set(
              members.filter((m) => m.year_level === year_level).map((m) => m.id)
            );
            const resultIds = new Set(result.map((m) => m.id));
            for (const id of expectedIds) {
              expect(resultIds.has(id)).toBe(true);
            }
          }
        ),
        { numRuns: 200 }
      );
    }
  );

  // -------------------------------------------------------------------------
  // type = "group" with multiple filters: only members matching ALL criteria
  // -------------------------------------------------------------------------
  it(
    'type="group" with multiple filters includes only members matching ALL criteria',
    () => {
      fc.assert(
        fc.property(
          memberArrayArb,
          courseArb,
          memberStatusArb,
          fc.integer({ min: 1, max: 4 }),
          (members, course, status, year_level) => {
            const result = resolveRecipients(members, {
              type: "group",
              filters: { course, status, year_level },
            });

            // Every returned member must satisfy ALL three filters
            for (const m of result) {
              expect(m.course).toBe(course);
              expect(m.status).toBe(status);
              expect(m.year_level).toBe(year_level);
            }

            // Every member satisfying all three filters must be in the result
            const expectedIds = new Set(
              members
                .filter(
                  (m) =>
                    m.course === course &&
                    m.status === status &&
                    m.year_level === year_level
                )
                .map((m) => m.id)
            );
            const resultIds = new Set(result.map((m) => m.id));
            for (const id of expectedIds) {
              expect(resultIds.has(id)).toBe(true);
            }

            // Result size must equal the number of members matching all criteria
            expect(result).toHaveLength(expectedIds.size);
          }
        ),
        { numRuns: 200 }
      );
    }
  );

  // -------------------------------------------------------------------------
  // type = "individual": only the specified member IDs are included
  // -------------------------------------------------------------------------
  it(
    'type="individual" includes only members whose IDs are in the memberIds list',
    () => {
      fc.assert(
        fc.property(
          memberArrayArb,
          (members) => {
            // Pick a random subset of IDs from the member array
            const allIds = members.map((m) => m.id);
            // Use every other member to form the target list
            const targetIds = allIds.filter((_, i) => i % 2 === 0);

            const result = resolveRecipients(members, {
              type: "individual",
              memberIds: targetIds,
            });

            const targetIdSet = new Set(targetIds);
            const resultIdSet = new Set(result.map((m) => m.id));

            // Every returned member must be in the target list
            for (const m of result) {
              expect(targetIdSet.has(m.id)).toBe(true);
            }

            // Every member in the target list that exists in the DB must be returned
            for (const id of targetIds) {
              if (allIds.includes(id)) {
                expect(resultIdSet.has(id)).toBe(true);
              }
            }
          }
        ),
        { numRuns: 200 }
      );
    }
  );

  it(
    'type="individual" with empty memberIds returns no recipients',
    () => {
      fc.assert(
        fc.property(memberArrayArb, (members) => {
          const result = resolveRecipients(members, {
            type: "individual",
            memberIds: [],
          });
          expect(result).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    }
  );

  it(
    'type="individual" with non-existent IDs returns no recipients',
    () => {
      fc.assert(
        fc.property(
          memberArrayArb,
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          (members, nonExistentIds) => {
            // Ensure none of the generated IDs collide with actual member IDs
            const memberIdSet = new Set(members.map((m) => m.id));
            const safeNonExistentIds = nonExistentIds.filter((id) => !memberIdSet.has(id));

            const result = resolveRecipients(members, {
              type: "individual",
              memberIds: safeNonExistentIds,
            });

            expect(result).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  // -------------------------------------------------------------------------
  // No member failing a filter criterion appears in the result (negation check)
  // -------------------------------------------------------------------------
  it(
    'type="group" never includes a member that fails any active filter criterion',
    () => {
      fc.assert(
        fc.property(
          memberArrayArb,
          fc.record({
            course: fc.option(courseArb, { nil: undefined }),
            status: fc.option(memberStatusArb, { nil: undefined }),
            year_level: fc.option(fc.integer({ min: 1, max: 4 }), { nil: undefined }),
          }),
          (members, filters) => {
            // Build a filters object with only defined keys
            const activeFilters: RecipientFilters = {};
            if (filters.course !== undefined) activeFilters.course = filters.course;
            if (filters.status !== undefined) activeFilters.status = filters.status;
            if (filters.year_level !== undefined) activeFilters.year_level = filters.year_level;

            const result = resolveRecipients(members, {
              type: "group",
              filters: activeFilters,
            });

            // No returned member should fail any active filter
            for (const m of result) {
              if (activeFilters.course !== undefined) {
                expect(m.course).toBe(activeFilters.course);
              }
              if (activeFilters.status !== undefined) {
                expect(m.status).toBe(activeFilters.status);
              }
              if (activeFilters.year_level !== undefined) {
                expect(m.year_level).toBe(activeFilters.year_level);
              }
            }
          }
        ),
        { numRuns: 200 }
      );
    }
  );

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  it('returns empty array for any type when member list is empty', () => {
    expect(resolveRecipients([], { type: "all" })).toHaveLength(0);
    expect(
      resolveRecipients([], { type: "group", filters: { course: "BSIT" } })
    ).toHaveLength(0);
    expect(
      resolveRecipients([], { type: "individual", memberIds: ["some-id"] })
    ).toHaveLength(0);
  });

  it('type="group" with empty filters object includes all members', () => {
    fc.assert(
      fc.property(memberArrayArb, (members) => {
        const result = resolveRecipients(members, { type: "group", filters: {} });
        expect(result).toHaveLength(members.length);
      }),
      { numRuns: 100 }
    );
  });
});
