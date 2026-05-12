/**
 * Property-Based Tests — Property 8: Form Step Validation Gate
 *
 * Feature: sbg-portal-redesign, Property 8: Form Step Validation Gate
 *
 * Validates: Requirements 3.4
 *
 * Property under test:
 *   For any set of field values on a given registration step that fails Zod
 *   validation, the schema returns `success: false`, which prevents the form
 *   from advancing to the next step and causes inline errors to be shown.
 *
 * Design note:
 *   The "form does not advance" guarantee is enforced by the Zod schemas:
 *   each step component calls `schema.safeParse(data)` before calling
 *   `goToStep(next)`. If `safeParse` returns `{ success: false }`, the step
 *   handler returns early and the form stays on the current step. Testing the
 *   schema directly is therefore equivalent to testing the gate behaviour.
 *
 * Schemas under test (frontend/src/lib/validations.ts):
 *   - registrationStep1Schema  (Step 1 — Personal Info)
 *   - registrationStep2Schema  (Step 2 — Application Questions)
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  registrationStep1Schema,
  registrationStep2Schema,
} from '../../lib/validations'

// ---------------------------------------------------------------------------
// Constants (must mirror validations.ts)
// ---------------------------------------------------------------------------
const STUDENT_NUMBER_REGEX = /^\d{4}-\d{5}-BN-\d$/
const VALID_GENDERS = ['Male', 'Female', 'NonBinary', 'PreferNotToSay'] as const

// ---------------------------------------------------------------------------
// Helpers — valid field generators
// ---------------------------------------------------------------------------

/** A full_name that satisfies the schema (2–100 chars). */
const arbValidFullName = fc.string({ minLength: 2, maxLength: 100 })

/** A student_number matching 20XX-XXXXX-BN-X. */
const arbValidStudentNumber = fc
  .tuple(
    fc.integer({ min: 2000, max: 2099 }),
    fc.integer({ min: 10000, max: 99999 }),
    fc.integer({ min: 0, max: 9 }),
  )
  .map(([year, seq, suffix]) => `${year}-${seq}-BN-${suffix}`)

/** A valid email address. */
const arbValidEmail = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z0-9]+$/.test(s)),
    fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z]+$/.test(s)),
    fc.constantFrom('com', 'net', 'org', 'edu'),
  )
  .map(([user, domain, tld]) => `${user}@${domain}.${tld}`)

/** A valid course string (non-empty). */
const arbValidCourse = fc.string({ minLength: 1, maxLength: 50 })

/** A valid year_level (1–6). */
const arbValidYearLevel = fc.integer({ min: 1, max: 6 })

/** A valid section (1–20 chars). */
const arbValidSection = fc.string({ minLength: 1, maxLength: 20 })

/** A valid gender. */
const arbValidGender = fc.constantFrom(...VALID_GENDERS)

/** A non-empty skills array. */
const arbValidSkills = fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 })

/** A valid Step 1 object (all fields pass). */
const arbValidStep1 = fc.record({
  full_name: arbValidFullName,
  student_number: arbValidStudentNumber,
  course: arbValidCourse,
  year_level: arbValidYearLevel,
  section: arbValidSection,
  email: arbValidEmail,
  scholar_email: arbValidEmail,
  gender: arbValidGender,
  skills: arbValidSkills,
})

/** A valid Step 2 object (all fields pass). */
const arbValidStep2 = fc.record({
  why_join: fc.string({ minLength: 50, maxLength: 500 }),
  expectations: fc.string({ minLength: 50, maxLength: 500 }),
})

// ---------------------------------------------------------------------------
// Helpers — invalid field generators
// ---------------------------------------------------------------------------

/** A full_name that is too short (0–1 chars) or too long (101+ chars). */
const arbInvalidFullName = fc.oneof(
  fc.string({ minLength: 0, maxLength: 1 }),
  fc.string({ minLength: 101, maxLength: 200 }),
)

/** A student_number that does NOT match the required regex. */
const arbInvalidStudentNumber = fc
  .string({ minLength: 0, maxLength: 30 })
  .filter((s) => !STUDENT_NUMBER_REGEX.test(s))

/** A string that is not a valid email. */
const arbInvalidEmail = fc
  .string({ minLength: 0, maxLength: 30 })
  .filter((s) => !s.includes('@') || s.startsWith('@') || s.endsWith('@'))

/** A gender value not in the allowed enum. */
const arbInvalidGender = fc
  .string()
  .filter((s) => !(VALID_GENDERS as readonly string[]).includes(s))

/** A why_join / expectations string shorter than 50 chars. */
const arbTooShortText = fc.string({ minLength: 0, maxLength: 49 })

// ---------------------------------------------------------------------------
// Property 8a — Step 1: any object with an invalid full_name is rejected
// ---------------------------------------------------------------------------
describe('Property 8a — Step 1: invalid full_name causes schema rejection', () => {
  it('rejects Step 1 data when full_name is empty or out of bounds', () => {
    fc.assert(
      fc.property(arbValidStep1, arbInvalidFullName, (base, badName) => {
        const data = { ...base, full_name: badName }
        const result = registrationStep1Schema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          const fields = result.error.issues.map((i) => i.path[0])
          expect(fields).toContain('full_name')
        }
      }),
      { numRuns: 200 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 8b — Step 1: any object with an invalid student_number is rejected
// ---------------------------------------------------------------------------
describe('Property 8b — Step 1: invalid student_number causes schema rejection', () => {
  it('rejects Step 1 data when student_number does not match the required format', () => {
    fc.assert(
      fc.property(arbValidStep1, arbInvalidStudentNumber, (base, badSn) => {
        const data = { ...base, student_number: badSn }
        const result = registrationStep1Schema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          const fields = result.error.issues.map((i) => i.path[0])
          expect(fields).toContain('student_number')
        }
      }),
      { numRuns: 200 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 8c — Step 1: any object with an invalid email is rejected
// ---------------------------------------------------------------------------
describe('Property 8c — Step 1: invalid email causes schema rejection', () => {
  it('rejects Step 1 data when email is not a valid email address', () => {
    fc.assert(
      fc.property(arbValidStep1, arbInvalidEmail, (base, badEmail) => {
        const data = { ...base, email: badEmail }
        const result = registrationStep1Schema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          const fields = result.error.issues.map((i) => i.path[0])
          expect(fields).toContain('email')
        }
      }),
      { numRuns: 200 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 8d — Step 1: any object with an empty skills array is rejected
// ---------------------------------------------------------------------------
describe('Property 8d — Step 1: empty skills array causes schema rejection', () => {
  it('rejects Step 1 data when skills is an empty array', () => {
    fc.assert(
      fc.property(arbValidStep1, (base) => {
        const data = { ...base, skills: [] }
        const result = registrationStep1Schema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          const fields = result.error.issues.map((i) => i.path[0])
          expect(fields).toContain('skills')
        }
      }),
      { numRuns: 200 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 8e — Step 1: any object with an invalid gender is rejected
// ---------------------------------------------------------------------------
describe('Property 8e — Step 1: invalid gender causes schema rejection', () => {
  it('rejects Step 1 data when gender is not one of the allowed enum values', () => {
    fc.assert(
      fc.property(arbValidStep1, arbInvalidGender, (base, badGender) => {
        const data = { ...base, gender: badGender }
        const result = registrationStep1Schema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          const fields = result.error.issues.map((i) => i.path[0])
          expect(fields).toContain('gender')
        }
      }),
      { numRuns: 200 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 8f — Step 2: why_join shorter than 50 chars is rejected
// ---------------------------------------------------------------------------
describe('Property 8f — Step 2: why_join < 50 chars causes schema rejection', () => {
  it('rejects Step 2 data when why_join has fewer than 50 characters', () => {
    fc.assert(
      fc.property(arbValidStep2, arbTooShortText, (base, shortText) => {
        const data = { ...base, why_join: shortText }
        const result = registrationStep2Schema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          const fields = result.error.issues.map((i) => i.path[0])
          expect(fields).toContain('why_join')
        }
      }),
      { numRuns: 200 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 8g — Step 2: expectations shorter than 50 chars is rejected
// ---------------------------------------------------------------------------
describe('Property 8g — Step 2: expectations < 50 chars causes schema rejection', () => {
  it('rejects Step 2 data when expectations has fewer than 50 characters', () => {
    fc.assert(
      fc.property(arbValidStep2, arbTooShortText, (base, shortText) => {
        const data = { ...base, expectations: shortText }
        const result = registrationStep2Schema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          const fields = result.error.issues.map((i) => i.path[0])
          expect(fields).toContain('expectations')
        }
      }),
      { numRuns: 200 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 8h — Step 2: both fields too short are both reported
// ---------------------------------------------------------------------------
describe('Property 8h — Step 2: both fields too short reports both errors', () => {
  it('reports errors for both why_join and expectations when both are too short', () => {
    fc.assert(
      fc.property(arbTooShortText, arbTooShortText, (shortWhy, shortExp) => {
        const data = { why_join: shortWhy, expectations: shortExp }
        const result = registrationStep2Schema.safeParse(data)
        expect(result.success).toBe(false)
        if (!result.success) {
          const fields = result.error.issues.map((i) => i.path[0])
          expect(fields).toContain('why_join')
          expect(fields).toContain('expectations')
        }
      }),
      { numRuns: 200 },
    )
  })
})

// ---------------------------------------------------------------------------
// Sanity check — valid data passes both schemas
// ---------------------------------------------------------------------------
describe('Sanity — valid data passes both schemas', () => {
  it('accepts Step 1 data when all fields are valid', () => {
    fc.assert(
      fc.property(arbValidStep1, (data) => {
        const result = registrationStep1Schema.safeParse(data)
        expect(result.success).toBe(true)
      }),
      { numRuns: 200 },
    )
  })

  it('accepts Step 2 data when all fields are valid', () => {
    fc.assert(
      fc.property(arbValidStep2, (data) => {
        const result = registrationStep2Schema.safeParse(data)
        expect(result.success).toBe(true)
      }),
      { numRuns: 200 },
    )
  })
})
