import { PrismaClient, Tone, ExistingPlan } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
	prismaClient: PrismaClient | undefined;
};

export const prismaClient = globalForPrisma.prismaClient ?? new PrismaClient();

if (process.env.NODE_ENV !== "production")
	globalForPrisma.prismaClient = prismaClient;

export { Tone, ExistingPlan };
export const prisma = new PrismaClient();
