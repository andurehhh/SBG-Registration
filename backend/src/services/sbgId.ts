// backend/src/services/sbgId.ts
import type { PrismaClient } from "@prisma/client";

/**
 * Pure function: generates an SBG ID string from year and sequence.
 * Format: SBG-{year}-{4-digit-zero-padded-seq}-PUPBC
 */
export function generateSbgId(year: number, sequence: number): string {
  return `SBG-${year}-${String(sequence).padStart(4, "0")}-PUPBC`;
}

/**
 * Generates a unique SBG ID for the given registration year.
 * Finds the highest existing sequence for that year, increments it,
 * and retries up to 10 times on collision.
 */
export async function generateUniqueSbgId(
  db: PrismaClient,
  registrationYear: number
): Promise<string> {
  // Find the highest existing sequence for this year
  const lastMember = await db.member.findFirst({
    where: {
      sbg_id: { startsWith: `SBG-${registrationYear}-` },
    },
    orderBy: { sbg_id: "desc" },
    select: { sbg_id: true },
  });

  let nextSequence = 1;
  if (lastMember?.sbg_id) {
    const parts = lastMember.sbg_id.split("-");
    // Format: SBG-{year}-{seq}-PUPBC → parts[2] is the sequence
    const currentSeq = parseInt(parts[2], 10);
    if (!isNaN(currentSeq)) {
      nextSequence = currentSeq + 1;
    }
  }

  // Collision retry loop (handles race conditions)
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateSbgId(registrationYear, nextSequence + attempt);
    const exists = await db.member.findUnique({
      where: { sbg_id: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
  }

  throw new Error(
    `Failed to generate unique SBG ID after 10 attempts for year ${registrationYear}`
  );
}
