// Mock Prisma Client
export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  plan: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  payment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  repo: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  repoConfig: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  generalConfig: {
    update: jest.fn(),
  },
  reviewConfig: {
    update: jest.fn(),
  },
  issueConfig: {
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};