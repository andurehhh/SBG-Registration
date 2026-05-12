// frontend/src/lib/utils.ts

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

const STICKER_COUNT = 10

/**
 * Deterministic sticker assignment based on member ID.
 * Same member always gets the same sticker within a session.
 * Returns a sticker ID like "sticker-03".
 */
export function assignSticker(memberId: string): string {
  let hash = 0
  for (let i = 0; i < memberId.length; i++) {
    hash = (hash * 31 + memberId.charCodeAt(i)) >>> 0
  }
  const index = (hash % STICKER_COUNT) + 1
  return `sticker-${String(index).padStart(2, '0')}`
}

/**
 * Formats a date into a school year string, e.g. "2025-2026".
 * School year starts in August (month index 7).
 */
export function formatSchoolYear(date: Date = new Date()): string {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month >= 7) {
    return `${year}-${year + 1}`
  }
  return `${year - 1}-${year}`
}

/**
 * Formats a date string to a readable format.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
