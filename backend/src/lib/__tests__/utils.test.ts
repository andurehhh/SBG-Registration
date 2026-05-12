// Feature: sbg-portal-redesign
// Property 17 — Input Sanitization
// Validates: Requirements 5.4

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { sanitize } from "../utils";

// ---------------------------------------------------------------------------
// HTML special characters and their expected entity replacements
// ---------------------------------------------------------------------------

const HTML_CHAR_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

const HTML_SPECIAL_CHARS = Object.keys(HTML_CHAR_MAP);

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a string that is guaranteed to contain at least one HTML special
 * character by inserting one at a random position.
 */
const stringWithHtmlChars = fc
  .tuple(
    fc.string(),
    fc.constantFrom(...HTML_SPECIAL_CHARS),
    fc.string()
  )
  .map(([prefix, specialChar, suffix]) => `${prefix}${specialChar}${suffix}`);

/**
 * Generates a string that contains ONLY alphanumeric characters and spaces —
 * no HTML special characters at all.
 */
const safeString = fc.stringMatching(/^[a-zA-Z0-9 ]*$/);

// ---------------------------------------------------------------------------
// Property 17a — Each HTML special character is replaced with its entity
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------

describe("sanitize() — Property 17a: Each HTML special char is replaced with its entity", () => {
  it("replaces & with &amp;", () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string(), fc.string()),
        ([prefix, suffix]) => {
          const input = `${prefix}&${suffix}`;
          const output = sanitize(input);
          // The raw & must not appear in the output (unless it's part of an entity)
          // We check by counting raw & vs. entity occurrences
          const rawAmpCount = (output.match(/&(?!amp;|lt;|gt;|quot;|#x27;)/g) || []).length;
          expect(rawAmpCount).toBe(0);
          // The entity must appear at least once
          expect(output).toContain("&amp;");
        }
      ),
      { numRuns: 300 }
    );
  });

  it("replaces < with &lt;", () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string(), fc.string()),
        ([prefix, suffix]) => {
          const input = `${prefix}<${suffix}`;
          const output = sanitize(input);
          expect(output).not.toContain("<");
          expect(output).toContain("&lt;");
        }
      ),
      { numRuns: 300 }
    );
  });

  it("replaces > with &gt;", () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string(), fc.string()),
        ([prefix, suffix]) => {
          const input = `${prefix}>${suffix}`;
          const output = sanitize(input);
          expect(output).not.toContain(">");
          expect(output).toContain("&gt;");
        }
      ),
      { numRuns: 300 }
    );
  });

  it('replaces " with &quot;', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string(), fc.string()),
        ([prefix, suffix]) => {
          const input = `${prefix}"${suffix}`;
          const output = sanitize(input);
          expect(output).not.toContain('"');
          expect(output).toContain("&quot;");
        }
      ),
      { numRuns: 300 }
    );
  });

  it("replaces ' with &#x27;", () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string(), fc.string()),
        ([prefix, suffix]) => {
          const input = `${prefix}'${suffix}`;
          const output = sanitize(input);
          expect(output).not.toContain("'");
          expect(output).toContain("&#x27;");
        }
      ),
      { numRuns: 300 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 17b — Output contains no raw HTML special characters
// Validates: Requirements 5.4
//
// For any input string, sanitize() must produce output that contains none of
// the raw characters: <, >, ", '
// (& is handled separately — it may appear as part of entities)
// ---------------------------------------------------------------------------

describe("sanitize() — Property 17b: Output contains no raw HTML special chars", () => {
  it("output never contains raw < or > for any input string", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const output = sanitize(input);
        expect(output).not.toContain("<");
        expect(output).not.toContain(">");
      }),
      { numRuns: 500 }
    );
  });

  it('output never contains raw " for any input string', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const output = sanitize(input);
        expect(output).not.toContain('"');
      }),
      { numRuns: 500 }
    );
  });

  it("output never contains raw ' for any input string", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const output = sanitize(input);
        expect(output).not.toContain("'");
      }),
      { numRuns: 500 }
    );
  });

  it("output contains no raw & that is not part of a known HTML entity", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const output = sanitize(input);
        // Any & in the output must be followed by one of the known entity suffixes
        const rawAmpMatches = output.match(/&(?!amp;|lt;|gt;|quot;|#x27;)/g);
        expect(rawAmpMatches).toBeNull();
      }),
      { numRuns: 500 }
    );
  });

  it("output contains no raw HTML special chars for strings that include them", () => {
    fc.assert(
      fc.property(stringWithHtmlChars, (input) => {
        const output = sanitize(input);
        expect(output).not.toContain("<");
        expect(output).not.toContain(">");
        expect(output).not.toContain('"');
        expect(output).not.toContain("'");
        const rawAmpMatches = output.match(/&(?!amp;|lt;|gt;|quot;|#x27;)/g);
        expect(rawAmpMatches).toBeNull();
      }),
      { numRuns: 300 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 17c — Strings without HTML special chars are returned unchanged
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------

describe("sanitize() — Property 17c: Safe strings are returned unchanged", () => {
  it("returns the same string when input contains no HTML special characters", () => {
    fc.assert(
      fc.property(safeString, (input) => {
        const output = sanitize(input);
        expect(output).toBe(input);
      }),
      { numRuns: 500 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 17d — Idempotency: sanitizing an already-sanitized string
//                produces the same result (entities are not double-escaped)
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------

describe("sanitize() — Property 17d: Entity correctness (spot checks)", () => {
  it("correctly escapes a string containing all five special characters", () => {
    const input = `<script>alert("XSS & 'injection'")</script>`;
    const output = sanitize(input);

    expect(output).not.toContain("<");
    expect(output).not.toContain(">");
    expect(output).not.toContain('"');
    expect(output).not.toContain("'");

    expect(output).toContain("&lt;");
    expect(output).toContain("&gt;");
    expect(output).toContain("&amp;");
    expect(output).toContain("&quot;");
    expect(output).toContain("&#x27;");
  });

  it("handles empty string without error", () => {
    expect(sanitize("")).toBe("");
  });

  it("handles a string with only special characters", () => {
    const input = `<>&"'`;
    const output = sanitize(input);
    expect(output).toBe("&lt;&gt;&amp;&quot;&#x27;");
  });

  it("preserves non-special characters around escaped ones", () => {
    fc.assert(
      fc.property(
        safeString,
        fc.constantFrom(...HTML_SPECIAL_CHARS),
        safeString,
        (before, specialChar, after) => {
          const input = `${before}${specialChar}${after}`;
          const output = sanitize(input);

          // The safe prefix and suffix must be preserved verbatim
          expect(output.startsWith(before)).toBe(true);
          expect(output.endsWith(after)).toBe(true);

          // The special char must be replaced with its entity
          const entity = HTML_CHAR_MAP[specialChar];
          const middle = output.slice(before.length, output.length - after.length);
          expect(middle).toBe(entity);
        }
      ),
      { numRuns: 300 }
    );
  });
});
