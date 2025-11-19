// jest.setup.ts
import { mockPrisma } from "./tests/mockPrisma";

// Set up global mocks before all tests
beforeAll(() => {
  // No setup needed for this project
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  // No cleanup needed for this project
});