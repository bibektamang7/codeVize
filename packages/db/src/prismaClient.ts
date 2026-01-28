// import { PrismaClient, Tone, ExistingPlan } from "@prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// const globalForPrisma = globalThis as unknown as {
// 	prismaClient: PrismaClient | undefined;
// };

// export const prismaClient = globalForPrisma.prismaClient ?? new PrismaClient();

// if (process.env.NODE_ENV !== "production")
// 	globalForPrisma.prismaClient = prismaClient;

// export { Tone, ExistingPlan };
// export const prisma = new PrismaClient({ adapter });
import 'dotenv/config'
import { PrismaClient, Tone, ExistingPlan } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { Tone, ExistingPlan }