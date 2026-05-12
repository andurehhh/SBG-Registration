// backend/src/lib/utils.ts

/**
 * Escapes HTML special characters to prevent stored XSS.
 * Replaces <, >, &, ", ' with their HTML entity equivalents.
 */
export function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Pure function: generates an SBG ID string from year and sequence.
 * Format: SBG-{year}-{4-digit-zero-padded-seq}-PUPBC
 */
export function generateSbgId(year: number, sequence: number): string {
  return `SBG-${year}-${String(sequence).padStart(4, "0")}-PUPBC`;
}

/**
 * Formats a Date into a school year string, e.g. "2025-2026".
 * The school year starts in August (month index 7).
 */
export function formatSchoolYear(date: Date = new Date()): string {
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();
  // If month is August (7) or later, school year is year/year+1
  // Otherwise it's (year-1)/year
  if (month >= 7) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}
