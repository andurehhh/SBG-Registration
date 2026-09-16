/**
 * Regression tests — Step 3 (Attachments) re-validates earlier steps.
 *
 * Bug: StepAttachments is not a react-hook-form. It used to read every field
 * straight from the Zustand store and submit them without re-validation, so a
 * blank field left in the store (e.g. via the "Other" course flow, or by
 * editing after navigating Back) slipped straight through to the server.
 *
 * Fix: StepAttachments.handleSubmit now runs registrationStep1Schema and
 * registrationStep2Schema against the store (safeParse) before building
 * FormData, and routes the user back to the first incomplete step.
 *
 * These tests exercise that exact guard logic against representative store
 * snapshots, so the "blank inputs get passed" regression can't return.
 */

import { describe, it, expect } from 'vitest'
import {
  registrationStep1Schema,
  registrationStep2Schema,
} from '../../lib/validations'

// Mirrors the store's initialState (all required fields blank/default).
const BLANK_STORE = {
  full_name: '',
  student_number: '',
  course: '',
  year_level: null as number | null,
  section: '',
  email: '',
  scholar_email: '',
  gender: '' as string,
  skills: [] as string[],
  why_join: '',
  expectations: '',
}

// A fully valid store snapshot.
const VALID_STORE = {
  full_name: 'Juan dela Cruz',
  student_number: '2026-12345-BN-0',
  course: 'BSIT',
  year_level: 2 as number | null,
  section: '1',
  email: 'juan@gmail.com',
  scholar_email: 'juan@iskolarngbayan.pup.edu.ph',
  gender: 'Male',
  skills: ['Cloud Computing'],
  why_join: 'I want to learn cloud computing and build real projects with peers.',
  expectations: 'Hands-on workshops, mentorship, and a portfolio-worthy project.',
}

/** Exactly what StepAttachments.handleSubmit feeds into safeParse. */
function step1FromStore(store: typeof BLANK_STORE) {
  return registrationStep1Schema.safeParse({
    full_name: store.full_name,
    student_number: store.student_number,
    course: store.course,
    year_level: store.year_level ?? undefined,
    section: store.section,
    email: store.email,
    scholar_email: store.scholar_email,
    gender: store.gender,
    skills: store.skills,
  })
}

function step2FromStore(store: typeof BLANK_STORE) {
  return registrationStep2Schema.safeParse({
    why_join: store.why_join,
    expectations: store.expectations,
  })
}

describe('StepAttachments guard — blank store is rejected before submit', () => {
  it('rejects a completely blank store at step 1', () => {
    expect(step1FromStore(BLANK_STORE).success).toBe(false)
  })

  it('rejects a blank store at step 2', () => {
    expect(step2FromStore(BLANK_STORE).success).toBe(false)
  })

  it('rejects when only the "Other" course was left empty (the reported hole)', () => {
    const store = { ...VALID_STORE, course: '' }
    expect(step1FromStore(store).success).toBe(false)
  })

  it('rejects when a single required field is blanked after editing', () => {
    for (const field of ['full_name', 'student_number', 'section', 'email', 'scholar_email', 'gender'] as const) {
      const store = { ...VALID_STORE, [field]: '' }
      expect(step1FromStore(store).success, `blank ${field} should fail`).toBe(false)
    }
  })

  it('rejects when skills were cleared', () => {
    expect(step1FromStore({ ...VALID_STORE, skills: [] }).success).toBe(false)
  })

  it('rejects when year_level is missing', () => {
    expect(step1FromStore({ ...VALID_STORE, year_level: null }).success).toBe(false)
  })

  it('rejects short application answers', () => {
    expect(step2FromStore({ ...VALID_STORE, why_join: 'too short' }).success).toBe(false)
    expect(step2FromStore({ ...VALID_STORE, expectations: 'nope' }).success).toBe(false)
  })
})

describe('StepAttachments guard — a complete store passes', () => {
  it('accepts a fully valid store at both steps', () => {
    expect(step1FromStore(VALID_STORE).success).toBe(true)
    expect(step2FromStore(VALID_STORE).success).toBe(true)
  })
})
