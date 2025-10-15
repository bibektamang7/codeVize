import { PrismaClient } from "@prisma/client";
import { Tone } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
	prismaClient: PrismaClient | undefined;
};

export const prismaClient = globalForPrisma.prismaClient ?? new PrismaClient();

if (process.env.NODE_ENV !== "production")
	globalForPrisma.prismaClient = prismaClient;

// This is for backend environment
export { Tone };
export const prisma = new PrismaClient();
