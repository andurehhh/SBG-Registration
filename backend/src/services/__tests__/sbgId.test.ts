// Feature: sbg-portal-redesign, Property 1: SBG ID Format
// Feature: sbg-portal-redesign, Property 2: SBG ID Uniqueness

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { generateSbgId } from "../../lib/utils";
import { generateUniqueSbgId } from "../sbgId";
import type { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Property 1 — SBG ID Format
// Validates: Requirements 1.8, 6.1
// ---------------------------------------------------------------------------

describe("generateSbgId — Property 1: SBG ID Format", () => {
  it("output matches /^SBG-\\d{4}-\\d{4}-PUPBC$/ for any valid year and sequence", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2099 }),
        fc.integer({ min: 1, max: 9999 }),
        (year, seq) => {
          const id = generateSbgId(year, seq);
          expect(id).toMatch(/^SBG-\d{4}-\d{4}-PUPBC$/);
        }
      ),
      { numRuns: 500 }
    );
  });

  it("year appears verbatim in the generated ID", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2099 }),
        fc.integer({ min: 1, max: 9999 }),
        (year, seq) => {
          const id = generateSbgId(year, seq);
          // The second segment (index 1) must be the year as a string
          const parts = id.split("-");
          expect(parts[1]).toBe(String(year));
        }
      ),
      { numRuns: 500 }
    );
  });

  it("sequence is zero-padded to exactly 4 digits", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2099 }),
        fc.integer({ min: 1, max: 9999 }),
        (year, seq) => {
          const id = generateSbgId(year, seq);
          const parts = id.split("-");
          // parts[2] is the zero-padded sequence
          const paddedSeq = parts[2];
          expect(paddedSeq).toHaveLength(4);
          expect(parseInt(paddedSeq, 10)).toBe(seq);
        }
      ),
      { numRuns: 500 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2 — SBG ID Uniqueness
// Validates: Requirements 6.2
// ---------------------------------------------------------------------------

/**
 * Build a minimal mock PrismaClient for the uniqueness test.
 *
 * Strategy:
 *  - `db.member.findFirst` returns the last existing ID for the year (or null
 *    when the existing list is empty), so `generateUniqueSbgId` can derive the
 *    next sequence to try.
 *  - `db.member.findUnique` always returns null, simulating no collision for
 *    the candidate ID — the function should therefore return on the first try.
 */
function buildMockDb(existingIds: string[]): PrismaClient {
  return {
    member: {
      findFirst: async () => {
        if (existingIds.length === 0) return null;
        // Return the lexicographically last ID (matches the real query's orderBy desc)
        const sorted = [...existingIds].sort();
        return { sbg_id: sorted[sorted.length - 1] };
      },
      findUnique: async () => null,
    },
  } as unknown as PrismaClient;
}

describe("generateUniqueSbgId — Property 2: SBG ID Uniqueness", () => {
  it("returns an ID not present in the existing set (empty existing IDs)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2020, max: 2099 }),
        async (year) => {
          const mockDb = buildMockDb([]);
          const result = await generateUniqueSbgId(mockDb, year);
          expect(result).not.toBeUndefined();
          expect(result).toMatch(/^SBG-\d{4}-\d{4}-PUPBC$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns an ID not present in the existing set (one existing ID)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2020, max: 2099 }),
        fc.integer({ min: 1, max: 9998 }),
        async (year, existingSeq) => {
          const existingId = generateSbgId(year, existingSeq);
          const mockDb = buildMockDb([existingId]);
          const result = await generateUniqueSbgId(mockDb, year);
          expect(result).not.toBe(existingId);
          expect(result).toMatch(/^SBG-\d{4}-\d{4}-PUPBC$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns an ID not present in the existing set (multiple existing IDs, up to 9)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2020, max: 2099 }),
        // Generate between 1 and 9 distinct sequences to stay within the retry limit
        fc.array(fc.integer({ min: 1, max: 9990 }), { minLength: 1, maxLength: 9 }),
        async (year, seqs) => {
          // Deduplicate sequences so the existing set is truly distinct
          const uniqueSeqs = [...new Set(seqs)];
          const existingIds = uniqueSeqs.map((s) => generateSbgId(year, s));

          // The mock findFirst returns the highest existing ID so the service
          // starts from max(seq)+1. findUnique always returns null (no collision).
          const sortedIds = [...existingIds].sort();
          const mockDb: PrismaClient = {
            member: {
              findFirst: async () => ({ sbg_id: sortedIds[sortedIds.length - 1] }),
              findUnique: async () => null,
            },
          } as unknown as PrismaClient;

          const result = await generateUniqueSbgId(mockDb, year);
          expect(existingIds).not.toContain(result);
          expect(result).toMatch(/^SBG-\d{4}-\d{4}-PUPBC$/);
        }
      ),
      { numRuns: 100 }
    );
  });
});
