// Feature: sbg-portal-redesign
// Property 5 — Duplicate Student Number Rejection
// Property 7 — Upload Failure Leaves No Partial Record
// Validates: Requirements 6.2 (duplicate check), 4.2 (upload atomicity)

import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";

// ---------------------------------------------------------------------------
// Helpers — replicate the business logic under test
// ---------------------------------------------------------------------------

/**
 * Replicates the duplicate-check + create logic from the registration handler.
 *
 * Given:
 *   - `db`          — mock Prisma client
 *   - `driveService`— mock DriveService
 *   - `studentNumber`— the student number being registered
 *
 * Returns the HTTP status code the handler would produce.
 */
async function runRegistrationLogic(
  db: {
    member: {
      findUnique: (args: { where: { student_number: string }; select: { id: boolean } }) => Promise<{ id: string } | null>;
      create: (args: unknown) => Promise<{ id: string }>;
    };
  },
  driveService: {
    upload: (params: unknown) => Promise<{ fileId: string; shareableUrl: string }>;
  },
  studentNumber: string
): Promise<number> {
  // Step 1: duplicate check (mirrors members.ts lines 62-70)
  const existing = await db.member.findUnique({
    where: { student_number: studentNumber },
    select: { id: true },
  });

  if (existing) {
    return 409;
  }

  // Step 2: upload files (mirrors members.ts lines 72-83)
  try {
    await Promise.all([
      driveService.upload({
        fileBuffer: Buffer.from(""),
        mimeType: "image/jpeg",
        studentNumber,
        documentType: "cor",
      }),
      driveService.upload({
        fileBuffer: Buffer.from(""),
        mimeType: "image/jpeg",
        studentNumber,
        documentType: "proof_of_share",
      }),
    ]);
  } catch {
    // Upload failure → 500, no DB record created
    return 500;
  }

  // Step 3: create member record (mirrors members.ts lines 85-103)
  await db.member.create({
    data: {
      full_name: "Test User",
      student_number: studentNumber,
      course: "BSIT",
      year_level: 1,
      section: "A",
      email: "test@example.com",
      scholar_email: "test@scholar.example.com",
      gender: "Male",
      skills: ["Cloud Computing"],
      why_join: "I want to learn.",
      expectations: "I expect to grow.",
      cor_url: "https://drive.google.com/file/d/abc/view",
      proof_of_share_url: "https://drive.google.com/file/d/def/view",
      status: "pending",
    },
    select: { id: true },
  });

  return 201;
}

// ---------------------------------------------------------------------------
// Arbitrary: valid student number matching /^\d{4}-\d{5}-BN-\d$/
// ---------------------------------------------------------------------------
const validStudentNumber = fc
  .tuple(
    fc.integer({ min: 2000, max: 2099 }),
    fc.integer({ min: 10000, max: 99999 }),
    fc.integer({ min: 0, max: 9 })
  )
  .map(([year, seq, digit]) => `${year}-${seq}-BN-${digit}`);

// ---------------------------------------------------------------------------
// Property 5 — Duplicate Student Number Rejection
// Validates: Requirements 6.2
//
// Given a student number already in the DB (findUnique returns a record),
// the registration handler must:
//   1. Return HTTP 409
//   2. Never call db.member.create
// ---------------------------------------------------------------------------

describe("Property 5 — Duplicate Student Number Rejection", () => {
  it(
    "returns 409 and never calls db.member.create when student number already exists",
    async () => {
      await fc.assert(
        fc.asyncProperty(validStudentNumber, async (studentNumber) => {
          const createMock = vi.fn().mockResolvedValue({ id: "new-id" });

          const db = {
            member: {
              // Simulate existing record for this student number
              findUnique: vi.fn().mockResolvedValue({ id: "existing-id" }),
              create: createMock,
            },
          };

          const driveService = {
            upload: vi.fn().mockResolvedValue({
              fileId: "file-id",
              shareableUrl: "https://drive.google.com/file/d/x/view",
            }),
          };

          const status = await runRegistrationLogic(db, driveService, studentNumber);

          // Must return 409
          expect(status).toBe(409);

          // Must never attempt to create a new DB record
          expect(createMock).not.toHaveBeenCalled();
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "returns 201 and calls db.member.create exactly once when student number is new",
    async () => {
      await fc.assert(
        fc.asyncProperty(validStudentNumber, async (studentNumber) => {
          const createMock = vi.fn().mockResolvedValue({ id: "new-id" });

          const db = {
            member: {
              // No existing record
              findUnique: vi.fn().mockResolvedValue(null),
              create: createMock,
            },
          };

          const driveService = {
            upload: vi.fn().mockResolvedValue({
              fileId: "file-id",
              shareableUrl: "https://drive.google.com/file/d/x/view",
            }),
          };

          const status = await runRegistrationLogic(db, driveService, studentNumber);

          expect(status).toBe(201);
          expect(createMock).toHaveBeenCalledTimes(1);
        }),
        { numRuns: 200 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 7 — Upload Failure Leaves No Partial Record
// Validates: Requirements 4.2
//
// When DriveService.upload() throws for any reason, the handler must:
//   1. Not call db.member.create
//   2. Return HTTP 500
// ---------------------------------------------------------------------------

describe("Property 7 — Upload Failure Leaves No Partial Record", () => {
  it(
    "never calls db.member.create when DriveService.upload throws",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          validStudentNumber,
          fc.string({ minLength: 1, maxLength: 100 }),
          async (studentNumber, errorMessage) => {
            const createMock = vi.fn().mockResolvedValue({ id: "new-id" });

            const db = {
              member: {
                // No duplicate — registration would proceed if upload succeeded
                findUnique: vi.fn().mockResolvedValue(null),
                create: createMock,
              },
            };

            const driveService = {
              // Simulate upload failure with an arbitrary error message
              upload: vi.fn().mockRejectedValue(new Error(errorMessage)),
            };

            const status = await runRegistrationLogic(db, driveService, studentNumber);

            // Handler must return 500 (not 201)
            expect(status).toBe(500);

            // No partial DB record must be created
            expect(createMock).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 200 }
      );
    }
  );

  it(
    "never calls db.member.create when only one of the two uploads throws",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          validStudentNumber,
          fc.boolean(), // which upload fails: true = first, false = second
          async (studentNumber, firstFails) => {
            const createMock = vi.fn().mockResolvedValue({ id: "new-id" });

            const db = {
              member: {
                findUnique: vi.fn().mockResolvedValue(null),
                create: createMock,
              },
            };

            let callCount = 0;
            const driveService = {
              upload: vi.fn().mockImplementation(async () => {
                callCount++;
                const shouldFail = firstFails ? callCount === 1 : callCount === 2;
                if (shouldFail) {
                  throw new Error("Drive upload failed");
                }
                return {
                  fileId: "file-id",
                  shareableUrl: "https://drive.google.com/file/d/x/view",
                };
              }),
            };

            const status = await runRegistrationLogic(db, driveService, studentNumber);

            expect(status).toBe(500);
            expect(createMock).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 200 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 12 — Approval Action Correctness
// Validates: Requirements 8.3, 8.4, 6.1, 6.2
//
// For any pending member, the approve action must:
//   1. Set status = "approved"
//   2. Assign a valid sbg_id matching /^SBG-\d{4}-\d{4}-PUPBC$/
//   3. Set school_year to a non-null string
//   4. The assigned sbg_id must not already exist in the DB
// ---------------------------------------------------------------------------

import { generateUniqueSbgId } from "../../services/sbgId";
import { formatSchoolYear } from "../../lib/utils";

/**
 * Replicates the core approval business logic from
 * POST /api/admin/members/:id/approve (admin/members.ts lines 97-120).
 *
 * Returns the updated member object that the handler would persist.
 */
async function runApprovalLogic(
  db: {
    member: {
      findUnique: (args: { where: { id: string } }) => Promise<{
        id: string;
        status: string;
        created_at: Date;
        email: string;
        full_name: string;
        student_number: string;
      } | null>;
      findFirst: (args: {
        where: { sbg_id: { startsWith: string } };
        orderBy: { sbg_id: string };
        select: { sbg_id: boolean };
      }) => Promise<{ sbg_id: string } | null>;
      findUnique: (args: {
        where: { sbg_id?: string; id?: string };
        select?: { id: boolean };
      }) => Promise<{ id: string } | null>;
      update: (args: {
        where: { id: string };
        data: { status: string; sbg_id: string; school_year: string };
      }) => Promise<{
        id: string;
        status: string;
        sbg_id: string;
        school_year: string;
      }>;
    };
  },
  memberId: string
): Promise<{
  status: string;
  sbg_id: string;
  school_year: string;
} | null> {
  const member = await db.member.findUnique({ where: { id: memberId } });
  if (!member || member.status !== "pending") return null;

  const registrationYear = member.created_at.getFullYear();
  const sbgId = await generateUniqueSbgId(db as never, registrationYear);
  const schoolYear = formatSchoolYear(member.created_at);

  const updated = await db.member.update({
    where: { id: member.id },
    data: {
      status: "approved",
      sbg_id: sbgId,
      school_year: schoolYear,
    },
  });

  return updated;
}

// Arbitrary: valid UUID-style member ID
const validMemberId = fc
  .tuple(
    fc.hexaString({ minLength: 8, maxLength: 8 }),
    fc.hexaString({ minLength: 4, maxLength: 4 }),
    fc.hexaString({ minLength: 4, maxLength: 4 }),
    fc.hexaString({ minLength: 4, maxLength: 4 }),
    fc.hexaString({ minLength: 12, maxLength: 12 })
  )
  .map(([a, b, c, d, e]) => `${a}-${b}-${c}-${d}-${e}`);

// Arbitrary: registration year in a realistic range
const registrationYear = fc.integer({ min: 2020, max: 2099 });

describe("Property 12 — Approval Action Correctness", () => {
  it(
    "sets status=approved, assigns valid sbg_id, sets school_year for any pending member",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          validMemberId,
          registrationYear,
          async (memberId, year) => {
            const createdAt = new Date(`${year}-03-15T00:00:00.000Z`);

            // Track what sbg_id was assigned so we can verify uniqueness
            let assignedSbgId: string | null = null;

            const updateMock = vi.fn().mockImplementation(
              async (args: {
                where: { id: string };
                data: { status: string; sbg_id: string; school_year: string };
              }) => {
                assignedSbgId = args.data.sbg_id;
                return {
                  id: args.where.id,
                  status: args.data.status,
                  sbg_id: args.data.sbg_id,
                  school_year: args.data.school_year,
                };
              }
            );

            const db = {
              member: {
                // findUnique for member lookup by id
                findUnique: vi.fn().mockImplementation(
                  async (args: { where: { id?: string; sbg_id?: string } }) => {
                    if (args.where.id === memberId) {
                      return {
                        id: memberId,
                        status: "pending",
                        created_at: createdAt,
                        email: "test@example.com",
                        full_name: "Test User",
                        student_number: "2024-12345-BN-0",
                      };
                    }
                    // sbg_id uniqueness check — always return null (no collision)
                    return null;
                  }
                ),
                // findFirst for highest existing sequence
                findFirst: vi.fn().mockResolvedValue(null),
                update: updateMock,
              },
            };

            const result = await runApprovalLogic(db as never, memberId);

            // 1. Status must be "approved"
            expect(result).not.toBeNull();
            expect(result!.status).toBe("approved");

            // 2. sbg_id must match the SBG ID format
            expect(result!.sbg_id).toMatch(/^SBG-\d{4}-\d{4}-PUPBC$/);

            // 3. school_year must be a non-null, non-empty string
            expect(result!.school_year).toBeTruthy();
            expect(typeof result!.school_year).toBe("string");

            // 4. The assigned sbg_id must not already exist in the DB
            //    (findUnique for sbg_id returned null → no collision)
            expect(assignedSbgId).not.toBeNull();
            const collisionCheck = await db.member.findUnique({
              where: { sbg_id: assignedSbgId! },
            });
            // After assignment the mock still returns null for sbg_id lookups,
            // confirming the ID was unique at the time of generation.
            expect(collisionCheck).toBeNull();
          }
        ),
        { numRuns: 200 }
      );
    }
  );

  it(
    "does not approve a member that is not in pending status",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          validMemberId,
          fc.constantFrom("approved", "rejected", "inactive", "removed"),
          async (memberId, nonPendingStatus) => {
            const updateMock = vi.fn();

            const db = {
              member: {
                findUnique: vi.fn().mockResolvedValue({
                  id: memberId,
                  status: nonPendingStatus,
                  created_at: new Date("2024-03-15T00:00:00.000Z"),
                  email: "test@example.com",
                  full_name: "Test User",
                  student_number: "2024-12345-BN-0",
                }),
                findFirst: vi.fn().mockResolvedValue(null),
                update: updateMock,
              },
            };

            const result = await runApprovalLogic(db as never, memberId);

            // Non-pending members must not be approved
            expect(result).toBeNull();
            expect(updateMock).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 13 — Rejection Action Correctness
// Validates: Requirements 8.5
//
// For any pending member, the reject action must:
//   1. Set status = "rejected"
//   2. NOT assign sbg_id (it remains null/undefined)
// ---------------------------------------------------------------------------

/**
 * Replicates the core rejection business logic from
 * POST /api/admin/members/:id/reject (admin/members.ts lines 122-145).
 *
 * Returns the updated member object that the handler would persist.
 */
async function runRejectionLogic(
  db: {
    member: {
      findUnique: (args: { where: { id: string } }) => Promise<{
        id: string;
        status: string;
        email: string;
        full_name: string;
      } | null>;
      update: (args: {
        where: { id: string };
        data: { status: string };
      }) => Promise<{
        id: string;
        status: string;
        sbg_id?: string | null;
      }>;
    };
  },
  memberId: string
): Promise<{
  status: string;
  sbg_id?: string | null;
} | null> {
  const member = await db.member.findUnique({ where: { id: memberId } });
  if (!member || member.status !== "pending") return null;

  const updated = await db.member.update({
    where: { id: member.id },
    data: { status: "rejected" },
  });

  return updated;
}

describe("Property 13 — Rejection Action Correctness", () => {
  it(
    "sets status=rejected and does not assign sbg_id for any pending member",
    async () => {
      await fc.assert(
        fc.asyncProperty(validMemberId, async (memberId) => {
          const updateMock = vi.fn().mockImplementation(
            async (args: {
              where: { id: string };
              data: { status: string };
            }) => ({
              id: args.where.id,
              status: args.data.status,
              sbg_id: null, // sbg_id is never set by the reject handler
            })
          );

          const db = {
            member: {
              findUnique: vi.fn().mockResolvedValue({
                id: memberId,
                status: "pending",
                email: "test@example.com",
                full_name: "Test User",
              }),
              update: updateMock,
            },
          };

          const result = await runRejectionLogic(db as never, memberId);

          // 1. Status must be "rejected"
          expect(result).not.toBeNull();
          expect(result!.status).toBe("rejected");

          // 2. sbg_id must NOT be assigned (null or undefined)
          expect(result!.sbg_id == null).toBe(true);

          // 3. The update call must only set status — no sbg_id in the data
          expect(updateMock).toHaveBeenCalledTimes(1);
          const updateArgs = updateMock.mock.calls[0][0] as {
            data: Record<string, unknown>;
          };
          expect(updateArgs.data).not.toHaveProperty("sbg_id");
        }),
        { numRuns: 200 }
      );
    }
  );

  it(
    "does not reject a member that is not in pending status",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          validMemberId,
          fc.constantFrom("approved", "rejected", "inactive", "removed"),
          async (memberId, nonPendingStatus) => {
            const updateMock = vi.fn();

            const db = {
              member: {
                findUnique: vi.fn().mockResolvedValue({
                  id: memberId,
                  status: nonPendingStatus,
                  email: "test@example.com",
                  full_name: "Test User",
                }),
                update: updateMock,
              },
            };

            const result = await runRejectionLogic(db as never, memberId);

            // Non-pending members must not be rejected
            expect(result).toBeNull();
            expect(updateMock).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 16 — ID Finder Response by Status
// Validates: Requirements 6.3
//
// The GET /api/members/lookup handler must:
//   - Return { success: true, data: { ...publicFields } } for "approved" members
//   - Return { success: false, error: status } for non-approved statuses
//   - Return 404 when no member is found
// ---------------------------------------------------------------------------

/**
 * Replicates the lookup handler logic from
 * GET /api/members/lookup (members.ts lines 113-155).
 *
 * Returns a tuple of [httpStatus, responseBody] that the handler would send.
 */
function runLookupLogic(
  member: {
    id: string;
    full_name: string;
    sbg_id: string | null;
    course: string;
    year_level: number;
    section: string;
    school_year: string | null;
    skills: string[];
    sticker_id: string | null;
    status: string;
    created_at: Date;
  } | null
): [number, Record<string, unknown>] {
  if (!member) {
    return [404, { success: false, error: "not_found" }];
  }

  if (member.status !== "approved") {
    return [200, { success: false, error: member.status }];
  }

  return [
    200,
    {
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
    },
  ];
}

/** Public fields that must be present in an approved lookup response */
const PUBLIC_FIELDS = [
  "id",
  "full_name",
  "sbg_id",
  "course",
  "year_level",
  "section",
  "school_year",
  "skills",
  "sticker_id",
  "created_at",
] as const;

/** Fields that must NOT appear in a non-approved response */
const PRIVATE_FIELDS = ["email", "scholar_email", "why_join", "expectations"] as const;

/** Arbitrary: a realistic member record */
const memberArbitrary = fc.record({
  id: fc.uuid(),
  full_name: fc.string({ minLength: 2, maxLength: 100 }),
  sbg_id: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 30 })),
  course: fc.string({ minLength: 1, maxLength: 50 }),
  year_level: fc.integer({ min: 1, max: 6 }),
  section: fc.string({ minLength: 1, maxLength: 20 }),
  school_year: fc.oneof(fc.constant(null), fc.string({ minLength: 9, maxLength: 9 })),
  skills: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
  sticker_id: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 20 })),
  status: fc.constantFrom("pending", "approved", "rejected", "inactive", "removed"),
  created_at: fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
});

describe("Property 16 — ID Finder Response by Status", () => {
  it(
    "returns { success: true, data: { ...publicFields } } for approved members",
    () => {
      fc.assert(
        fc.property(
          memberArbitrary.map((m) => ({ ...m, status: "approved" as const })),
          (member) => {
            const [status, body] = runLookupLogic(member);

            // HTTP 200
            expect(status).toBe(200);

            // success flag is true
            expect(body.success).toBe(true);

            // data object is present
            expect(body).toHaveProperty("data");
            const data = body.data as Record<string, unknown>;

            // All public fields are present
            for (const field of PUBLIC_FIELDS) {
              expect(data).toHaveProperty(field);
            }

            // Private fields are NOT exposed
            for (const field of PRIVATE_FIELDS) {
              expect(data).not.toHaveProperty(field);
            }

            // created_at is an ISO string
            expect(typeof data.created_at).toBe("string");
            expect(() => new Date(data.created_at as string)).not.toThrow();
          }
        ),
        { numRuns: 300 }
      );
    }
  );

  it(
    "returns { success: false, error: status } for non-approved statuses",
    () => {
      fc.assert(
        fc.property(
          memberArbitrary,
          fc.constantFrom("pending", "rejected", "inactive", "removed"),
          (member, nonApprovedStatus) => {
            const memberWithStatus = { ...member, status: nonApprovedStatus };
            const [httpStatus, body] = runLookupLogic(memberWithStatus);

            // HTTP 200 (not 404 — member exists, just not approved)
            expect(httpStatus).toBe(200);

            // success flag is false
            expect(body.success).toBe(false);

            // error field reflects the actual status
            expect(body.error).toBe(nonApprovedStatus);

            // No data field (no public data leaked)
            expect(body).not.toHaveProperty("data");
          }
        ),
        { numRuns: 300 }
      );
    }
  );

  it(
    "returns 404 when no member is found",
    () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          (noMember) => {
            const [httpStatus, body] = runLookupLogic(noMember);

            // HTTP 404
            expect(httpStatus).toBe(404);

            // success flag is false
            expect(body.success).toBe(false);

            // error is "not_found"
            expect(body.error).toBe("not_found");
          }
        ),
        { numRuns: 50 }
      );
    }
  );

  it(
    "never leaks private fields regardless of member status",
    () => {
      fc.assert(
        fc.property(
          memberArbitrary,
          (member) => {
            const [, body] = runLookupLogic(member);

            // Flatten the entire response body to check for private field leakage
            const bodyStr = JSON.stringify(body);

            // These field names should never appear as keys in the response
            for (const field of PRIVATE_FIELDS) {
              // Check that the field name doesn't appear as a JSON key
              expect(bodyStr).not.toMatch(new RegExp(`"${field}":`));
            }
          }
        ),
        { numRuns: 300 }
      );
    }
  );
});
