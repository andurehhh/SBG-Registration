/**
 * Property-Based Tests — Property 4: File Upload Validation
 *
 * Validates: Requirements 8.7 (FileUpload component validates size ≤ 1 MB
 * and MIME type before accepting a file)
 *
 * Rules under test (mirrored from FileUpload.tsx):
 *   - Allowed MIME types: image/jpeg, image/png, application/pdf
 *   - Maximum file size: 1,048,576 bytes (1 MiB)
 *   - A file is accepted iff BOTH conditions hold simultaneously.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { isFileValid } from '../ui/FileUpload'

// ---------------------------------------------------------------------------
// Constants (must match FileUpload.tsx)
// ---------------------------------------------------------------------------
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1,048,576 bytes
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const

// ---------------------------------------------------------------------------
// Helper: build a File-like object with a controlled size
// ---------------------------------------------------------------------------
function makeFile(size: number, mimeType: string): File {
  const file = new File(['x'], 'test-file', { type: mimeType })
  // Override the read-only `size` property
  Object.defineProperty(file, 'size', { value: size, writable: false })
  return file
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Any integer (positive, negative, zero) — used as raw file size. */
const arbSize = fc.integer()

/** Any string — used as raw MIME type. */
const arbMime = fc.string()

/** A valid MIME type from the allowed set. */
const arbValidMime = fc.constantFrom(...ALLOWED_MIME_TYPES)

/** A size that is within the allowed limit (0 … MAX_FILE_SIZE). */
const arbValidSize = fc.integer({ min: 0, max: MAX_FILE_SIZE })

/** A size that exceeds the limit. */
const arbOversizedSize = fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 10 })

// ---------------------------------------------------------------------------
// Property 4a — Accepted iff valid (biconditional)
//
// For any (size, mimeType) pair:
//   isFileValid(file) === (size <= MAX_FILE_SIZE && ALLOWED_MIME_TYPES.includes(mimeType))
// ---------------------------------------------------------------------------
describe('Property 4a — Accepted iff valid (biconditional)', () => {
  it('accepts a file if and only if size ≤ 1,048,576 AND MIME is in the allowed set', () => {
    fc.assert(
      fc.property(arbSize, arbMime, (size, mimeType) => {
        const file = makeFile(size, mimeType)
        const expected =
          size <= MAX_FILE_SIZE && ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number])
        expect(isFileValid(file)).toBe(expected)
      }),
      { numRuns: 1000 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 4b — Rejected if size exceeds limit (regardless of MIME type)
// ---------------------------------------------------------------------------
describe('Property 4b — Rejected if size exceeds limit', () => {
  it('rejects any file whose size > 1,048,576 regardless of MIME type', () => {
    fc.assert(
      fc.property(arbOversizedSize, arbMime, (size, mimeType) => {
        const file = makeFile(size, mimeType)
        expect(isFileValid(file)).toBe(false)
      }),
      { numRuns: 500 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 4c — Rejected if MIME type is not in the allowed set
// ---------------------------------------------------------------------------
describe('Property 4c — Rejected if MIME type is not in the allowed set', () => {
  it('rejects any file with a MIME type not in {image/jpeg, image/png, application/pdf}', () => {
    // Generate MIME strings that are NOT in the allowed set
    const arbInvalidMime = arbMime.filter(
      (m) => !ALLOWED_MIME_TYPES.includes(m as typeof ALLOWED_MIME_TYPES[number])
    )

    fc.assert(
      fc.property(arbSize, arbInvalidMime, (size, mimeType) => {
        const file = makeFile(size, mimeType)
        expect(isFileValid(file)).toBe(false)
      }),
      { numRuns: 500 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 4d — Accepted for all valid (MIME, size) combinations
// ---------------------------------------------------------------------------
describe('Property 4d — Accepted for all valid combinations', () => {
  it('accepts any file with a valid MIME type and size ≤ 1,048,576', () => {
    fc.assert(
      fc.property(arbValidMime, arbValidSize, (mimeType, size) => {
        const file = makeFile(size, mimeType)
        expect(isFileValid(file)).toBe(true)
      }),
      { numRuns: 500 }
    )
  })
})
