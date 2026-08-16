/**
 * Property-Based Tests — Property 9: Progress Bar Segment Count
 *
 * Feature: sbg-portal-redesign, Property 9: Progress Bar Segment Count
 *
 * Validates: Requirements 3.2
 *
 * Property under test:
 *   For any step value `s` in {1, 2, 3}, the ProgressBar component rendered
 *   with `current=s` and `total=3` shall display exactly `s` filled segments
 *   (CSS class `bg-white`) and exactly `3 - s` unfilled segments
 *   (CSS class `bg-white/[0.06]`).
 */

import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { ProgressBar } from '../registration/ProgressBar'

afterEach(() => {
  cleanup()
})

const FILLED_CLASS = 'bg-white'
const UNFILLED_CLASS = 'bg-white/[0.06]'
const TOTAL = 3

describe('Property 9 — Progress Bar Segment Count', () => {
  it('renders exactly `current` filled and `3 - current` unfilled segments for any step in [1, 3]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 3 }), (current) => {
        const { container } = render(<ProgressBar current={current} total={TOTAL} />)

        const allSegments = container.querySelectorAll('div.flex-1')

        expect(allSegments).toHaveLength(TOTAL)

        const filledSegments = Array.from<Element>(allSegments).filter((el) =>
          el.classList.contains(FILLED_CLASS),
        )
        const unfilledSegments = Array.from<Element>(allSegments).filter((el) =>
          el.classList.contains(UNFILLED_CLASS),
        )

        expect(filledSegments).toHaveLength(current)
        expect(unfilledSegments).toHaveLength(TOTAL - current)

        expect(filledSegments.length + unfilledSegments.length).toBe(TOTAL)

        cleanup()
      }),
      { numRuns: 100 },
    )
  })
})

describe('Property 9b — Filled segments precede unfilled segments', () => {
  it('places all filled segments before all unfilled segments', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 3 }), (current) => {
        const { container } = render(<ProgressBar current={current} total={TOTAL} />)

        const allSegments = Array.from<Element>(container.querySelectorAll('div.flex-1'))

        allSegments.forEach((el, index) => {
          if (index < current) {
            expect(el.classList.contains(FILLED_CLASS)).toBe(true)
            expect(el.classList.contains(UNFILLED_CLASS)).toBe(false)
          } else {
            expect(el.classList.contains(UNFILLED_CLASS)).toBe(true)
            expect(el.classList.contains(FILLED_CLASS)).toBe(false)
          }
        })

        cleanup()
      }),
      { numRuns: 100 },
    )
  })
})

describe('Property 9c — Step label text is correct', () => {
  it('renders the correct "Step X of 3" label for any step in [1, 3]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 3 }), (current) => {
        const { getByText } = render(<ProgressBar current={current} total={TOTAL} />)

        expect(getByText(`Step ${current} of ${TOTAL}`)).toBeTruthy()

        cleanup()
      }),
      { numRuns: 100 },
    )
  })
})

describe('ProgressBar — example-based sanity checks', () => {
  it('Step 1 of 3: 1 filled, 2 unfilled', () => {
    const { container } = render(<ProgressBar current={1} total={3} />)
    const segments = container.querySelectorAll('div.flex-1')
    const filled = Array.from<Element>(segments).filter((el) => el.classList.contains(FILLED_CLASS))
    const unfilled = Array.from<Element>(segments).filter((el) => el.classList.contains(UNFILLED_CLASS))
    expect(filled).toHaveLength(1)
    expect(unfilled).toHaveLength(2)
  })

  it('Step 2 of 3: 2 filled, 1 unfilled', () => {
    const { container } = render(<ProgressBar current={2} total={3} />)
    const segments = container.querySelectorAll('div.flex-1')
    const filled = Array.from<Element>(segments).filter((el) => el.classList.contains(FILLED_CLASS))
    const unfilled = Array.from<Element>(segments).filter((el) => el.classList.contains(UNFILLED_CLASS))
    expect(filled).toHaveLength(2)
    expect(unfilled).toHaveLength(1)
  })

  it('Step 3 of 3: 3 filled, 0 unfilled', () => {
    const { container } = render(<ProgressBar current={3} total={3} />)
    const segments = container.querySelectorAll('div.flex-1')
    const filled = Array.from<Element>(segments).filter((el) => el.classList.contains(FILLED_CLASS))
    const unfilled = Array.from<Element>(segments).filter((el) => el.classList.contains(UNFILLED_CLASS))
    expect(filled).toHaveLength(3)
    expect(unfilled).toHaveLength(0)
  })
})
