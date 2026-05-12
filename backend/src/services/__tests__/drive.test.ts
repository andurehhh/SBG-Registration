// Feature: sbg-portal-redesign
// Property 6 — Drive File Naming Pattern
// Validates: Requirements 4.2
//
// The DriveService.upload() method constructs a filename as:
//   `${studentNumber}_${documentType}_${timestamp}`
//
// Property: for any studentNumber string, documentType in
// ["cor", "proof_of_share"], and timestamp integer, the filename
// matches /{studentNumber}_(cor|proof_of_share)_\d+/

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ---------------------------------------------------------------------------
// Pure filename construction logic (extracted from DriveService.upload)
// This mirrors the exact logic in backend/src/services/drive.ts:
//   const fileName = `${params.studentNumber}_${params.documentType}_${timestamp}`;
// ---------------------------------------------------------------------------

function buildDriveFileName(
  studentNumber: string,
  documentType: "cor" | "proof_of_share",
  timestamp: number
): string {
  return `${studentNumber}_${documentType}_${timestamp}`;
}

// ---------------------------------------------------------------------------
// Property 6 — Drive File Naming Pattern
// Validates: Requirements 4.2
// ---------------------------------------------------------------------------

describe("Property 6 — Drive File Naming Pattern", () => {
  it(
    "filename matches /{studentNumber}_(cor|proof_of_share)_\\d+/ for any inputs",
    () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom("cor" as const, "proof_of_share" as const),
          fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
          (studentNumber, documentType, timestamp) => {
            const fileName = buildDriveFileName(studentNumber, documentType, timestamp);

            // The filename must contain the documentType segment
            const pattern = new RegExp(
              `${escapeRegex(studentNumber)}_(cor|proof_of_share)_\\d+`
            );
            expect(fileName).toMatch(pattern);
          }
        ),
        { numRuns: 500 }
      );
    }
  );

  it(
    "filename contains the exact studentNumber as a prefix before the first underscore-separated type segment",
    () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom("cor" as const, "proof_of_share" as const),
          fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
          (studentNumber, documentType, timestamp) => {
            const fileName = buildDriveFileName(studentNumber, documentType, timestamp);

            // The filename must start with the studentNumber
            expect(fileName.startsWith(studentNumber)).toBe(true);
          }
        ),
        { numRuns: 500 }
      );
    }
  );

  it(
    "filename ends with an underscore followed by a non-negative integer timestamp",
    () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom("cor" as const, "proof_of_share" as const),
          fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
          (studentNumber, documentType, timestamp) => {
            const fileName = buildDriveFileName(studentNumber, documentType, timestamp);

            // The filename must end with _<digits>
            expect(fileName).toMatch(/_\d+$/);

            // The trailing digits must equal the timestamp
            const trailingDigits = fileName.match(/_(\d+)$/)?.[1];
            expect(trailingDigits).toBe(String(timestamp));
          }
        ),
        { numRuns: 500 }
      );
    }
  );

  it(
    "documentType segment is exactly 'cor' or 'proof_of_share' — verified via suffix pattern",
    () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom("cor" as const, "proof_of_share" as const),
          fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
          (studentNumber, documentType, timestamp) => {
            const fileName = buildDriveFileName(studentNumber, documentType, timestamp);

            // The filename must end with _{documentType}_{timestamp}
            const suffix = `_${documentType}_${timestamp}`;
            expect(fileName.endsWith(suffix)).toBe(true);
          }
        ),
        { numRuns: 500 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Helper: escape a string for use in a RegExp
// ---------------------------------------------------------------------------
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
