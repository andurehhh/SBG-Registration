// backend/src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Executes a Prisma operation with automatic retry on connection errors.
 * Neon serverless Postgres suspends after inactivity — the first query after
 * suspension may fail with E57P01. This retries up to 3 times with backoff.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (err: unknown) {
      const isConnectionError =
        err instanceof Error &&
        (err.message.includes("E57P01") ||
          err.message.includes("terminating connection") ||
          err.message.includes("Connection refused") ||
          err.message.includes("ECONNRESET") ||
          err.message.includes("Can't reach database server"));

      if (isConnectionError && attempt < retries) {
        console.warn(`DB connection error (attempt ${attempt}/${retries}), retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        // Reconnect Prisma
        await db.$disconnect().catch(() => {});
        await db.$connect().catch(() => {});
        continue;
      }
      throw err;
    }
  }
  // TypeScript needs this even though the loop always returns or throws
  throw new Error("Unreachable");
}

export default db;
