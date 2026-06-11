import type { Member } from "../types";

const CSV_COLUMNS = [
  "full_name",
  "student_number",
  "email",
  "course",
  "year_level",
  "section",
  "status",
  "sbg_id",
  "school_year",
  "created_at",
] as const;

/**
 * Escape a CSV field value per RFC 4180.
 * If the value contains a comma, double-quote, or newline,
 * wrap the entire field in double quotes and double any internal quotes.
 */
export function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate a CSV string from an array of Member objects.
 * Produces a header row followed by one data row per member,
 * with exactly 10 columns in the defined order.
 * Null/undefined values are converted to empty strings.
 */
export function generateCsv(members: Member[]): string {
  const header = CSV_COLUMNS.join(",");

  const rows = members.map((member) =>
    CSV_COLUMNS.map((col) => {
      const raw = member[col];
      const value = raw == null ? "" : String(raw);
      return escapeCsvField(value);
    }).join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Trigger a browser file download for the given CSV content.
 * Creates a Blob with text/csv type, generates an object URL,
 * programmatically clicks a hidden anchor element, then revokes the URL.
 */
export function triggerDownload(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
