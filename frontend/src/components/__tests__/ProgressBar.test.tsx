/**
 * ProgressBar — step indicator behavior
 *
 * Validates the accessible step indicator: named steps, correct current-step
 * marking (aria-current), and segment count for any step in {1, 2, 3}.
 */

import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { ProgressBar } from '../registration/ProgressBar'

afterEach(() => {
  cleanup()
})

const STEPS = ['Personal Information', 'Application Questions', 'Attachments']
const TOTAL = 3

describe('ProgressBar — segment count', () => {
  it('renders exactly `total` step items for any step in [1, 3]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 3 }), (current) => {
        const { container } = render(<ProgressBar current={current} total={TOTAL} />)
        const items = container.querySelectorAll('li')
        expect(items).toHaveLength(TOTAL)
        cleanup()
      }),
      { numRuns: 50 },
    )
  })
})

describe('ProgressBar — current step marking', () => {
  it('marks exactly the current step with aria-current="step"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 3 }), (current) => {
        const { container } = render(<ProgressBar current={current} total={TOTAL} />)
        const currentItems = container.querySelectorAll('li[aria-current="step"]')
        expect(currentItems).toHaveLength(1)
        // The marked item should correspond to the current step's label
        expect(currentItems[0].textContent).toContain(STEPS[current - 1])
        cleanup()
      }),
      { numRuns: 50 },
    )
  })
})

describe('ProgressBar — named steps', () => {
  it('renders all three step names', () => {
    const { getByText } = render(<ProgressBar current={1} total={3} />)
    STEPS.forEach((label) => {
      expect(getByText(label)).toBeTruthy()
    })
  })

  it('exposes an accessible progress navigation landmark', () => {
    const { container } = render(<ProgressBar current={2} total={3} />)
    const nav = container.querySelector('nav[aria-label="Registration progress"]')
    expect(nav).toBeTruthy()
  })
})
