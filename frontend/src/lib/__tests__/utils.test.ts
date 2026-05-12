/**
 * Property-Based Tests — Property 10: Sticker Assignment Determinism
 *
 * Feature: sbg-portal-redesign, Property 10: Sticker Assignment Determinism
 *
 * **Validates: Requirements 11.5**
 *
 * Properties under test:
 *   10a — Determinism:
 *     For any member ID string, `assignSticker(id)` returns the same value
 *     on every call (pure, no side effects, no randomness).
 *
 *   10b — Format:
 *     The returned value always matches the regex `/^sticker-\d{2}$/`.
 *
 *   10c — Range:
 *     The numeric part of the returned value is between 01 and STICKER_COUNT
 *     (inclusive), i.e. the integer value is in [1, 10].
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { assignSticker } from '../utils'

// ---------------------------------------------------------------------------
// Constants (must match utils.ts)
// ---------------------------------------------------------------------------
const STICKER_COUNT = 10
const STICKER_FORMAT = /^sticker-\d{2}$/

// ---------------------------------------------------------------------------
// Property 10a — Determinism
//
// For any string `id`, calling `assignSticker(id)` twice returns the same
// value. The function is pure and has no internal state.
// ---------------------------------------------------------------------------
describe('Property 10a — Sticker Assignment Determinism', () => {
  it('returns the same sticker ID on repeated calls with the same member ID', () => {
    fc.assert(
      fc.property(fc.string(), (id) => {
        const first = assignSticker(id)
        const second = assignSticker(id)
        expect(first).toBe(second)
      }),
      { numRuns: 1000 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 10b — Format
//
// For any string `id`, the returned value matches `/^sticker-\d{2}$/`.
// This ensures the prefix is always "sticker-" and the suffix is always
// exactly two decimal digits (zero-padded).
// ---------------------------------------------------------------------------
describe('Property 10b — Sticker ID Format', () => {
  it('always returns a value matching /^sticker-\\d{2}$/', () => {
    fc.assert(
      fc.property(fc.string(), (id) => {
        const stickerId = assignSticker(id)
        expect(stickerId).toMatch(STICKER_FORMAT)
      }),
      { numRuns: 1000 },
    )
  })
})

// ---------------------------------------------------------------------------
// Property 10c — Range
//
// For any string `id`, the numeric part of the returned sticker ID is an
// integer in [1, STICKER_COUNT] (i.e. 01–10 inclusive).
// ---------------------------------------------------------------------------
describe('Property 10c — Sticker ID Numeric Range', () => {
  it('returns a numeric part between 01 and STICKER_COUNT (inclusive)', () => {
    fc.assert(
      fc.property(fc.string(), (id) => {
        const stickerId = assignSticker(id)
        // Extract the numeric suffix after "sticker-"
        const numericPart = stickerId.slice('sticker-'.length)
        const index = parseInt(numericPart, 10)
        expect(index).toBeGreaterThanOrEqual(1)
        expect(index).toBeLessThanOrEqual(STICKER_COUNT)
      }),
      { numRuns: 1000 },
    )
  })
})

// ---------------------------------------------------------------------------
// Example-based sanity checks
// ---------------------------------------------------------------------------
describe('assignSticker — example-based sanity checks', () => {
  it('returns a valid sticker ID for an empty string', () => {
    const result = assignSticker('')
    expect(result).toMatch(STICKER_FORMAT)
    const index = parseInt(result.slice('sticker-'.length), 10)
    expect(index).toBeGreaterThanOrEqual(1)
    expect(index).toBeLessThanOrEqual(STICKER_COUNT)
  })

  it('returns a valid sticker ID for a typical UUID-style member ID', () => {
    const result = assignSticker('550e8400-e29b-41d4-a716-446655440000')
    expect(result).toMatch(STICKER_FORMAT)
  })

  it('returns the same sticker for the same ID across multiple calls', () => {
    const id = 'SBG-2026-0042-PUPBC'
    const results = Array.from({ length: 10 }, () => assignSticker(id))
    expect(new Set(results).size).toBe(1)
  })

  it('zero-pads single-digit sticker indices (e.g. sticker-01 not sticker-1)', () => {
    // Brute-force: find an ID that maps to index 1 and verify zero-padding
    // We know the format must always be two digits, so any result must be padded.
    // Just verify the format constraint holds for a range of simple inputs.
    for (let i = 0; i < 100; i++) {
      const result = assignSticker(String(i))
      expect(result).toMatch(STICKER_FORMAT)
    }
  })
})
