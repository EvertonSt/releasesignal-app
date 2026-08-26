// ── Database Client ────────────────────────────────────────────────────────
// Prisma client singleton. Lazy-loaded; only connects when DATABASE_URL is set.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const DEFAULT_ORG_ID = "org_demo_001";

export async function getOrganizationId(): Promise<string> {
  // In production, derive from session/auth context
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true"
    ? DEFAULT_ORG_ID
    : DEFAULT_ORG_ID; // TODO: resolve from session
}

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export { DEFAULT_ORG_ID as ORG_ID };
