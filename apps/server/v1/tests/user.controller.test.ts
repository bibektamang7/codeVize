import { mockPrisma } from "./mockPrisma";
import { mockRequest, mockResponse, mockNext } from "./testUtils";

// Mock the db/prisma import
jest.mock("db/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock the jwt module
jest.mock("jwt", () => ({
  createToken: jest.fn().mockReturnValue("mocked-token"),
}));

// Import the controllers after mocking
import {
  loginUser,
  registerUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginUser", () => {
    it("should login user successfully", async () => {
      const mockUser = {
        id: "user1",
        githubId: "12345",
        email: "test@example.com",
        username: "testuser",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const req = mockRequest({}, { githubId: "12345", email: "test@example.com" });
      const res = mockResponse();

      await loginUser(req, res, mockResponse());

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { githubId: "12345" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        token: "mocked-token",
      });
    });

    it("should throw 400 error if githubId or email not provided", async () => {
      const req = mockRequest({}, { githubId: undefined, email: undefined });
      const res = mockResponse();
      const next = mockResponse();

      await expect(loginUser(req, res, next)).rejects.toThrow();
    });

    it("should throw 400 error if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const req = mockRequest({}, { githubId: "12345", email: "test@example.com" });
      const res = mockResponse();
      const next = mockResponse();

      await expect(loginUser(req, res, next)).rejects.toThrow();
    });

    it("should throw 400 error if email doesn't match", async () => {
      const mockUser = {
        id: "user1",
        githubId: "12345",
        email: "different@example.com",
        username: "testuser",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const req = mockRequest({}, { githubId: "12345", email: "test@example.com" });
      const res = mockResponse();
      const next = mockResponse();

      await expect(loginUser(req, res, next)).rejects.toThrow();
    });

    it("should throw 400 error if token creation fails", async () => {
      jest.mock("jwt", () => ({
        createToken: jest.fn().mockReturnValue(null),
      }));

      // Need to reimport the controller to get the updated mock
      const {
        loginUser: newLoginUser,
      } = await import("../controllers/user.controller");

      const mockUser = {
        id: "user1",
        githubId: "12345",
        email: "test@example.com",
        username: "testuser",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const req = mockRequest({}, { githubId: "12345", email: "test@example.com" });
      const res = mockResponse();
      const next = mockResponse();

      await expect(newLoginUser(req, res, next)).rejects.toThrow();
    });
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      const mockUser = {
        id: "user1",
        githubId: "12345",
        email: "test@example.com",
        username: "testuser",
        image: "https://example.com/image.jpg",
        planName: "FREE",
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const req = mockRequest({}, {
        githubId: "12345",
        email: "test@example.com",
        username: "testuser",
        image: "https://example.com/image.jpg",
      });
      const res = mockResponse();
      const next = mockResponse();

      await registerUser(req, res, next);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { githubId: "12345" },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          githubId: "12345",
          username: "testuser",
          image: "https://example.com/image.jpg",
          planName: "FREE",
          plan: {
            connect: {
              name: "FREE",
            },
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: mockUser,
        token: "mocked-token",
      });
    });

    it("should throw 400 error if required fields not provided", async () => {
      const req = mockRequest({}, {
        githubId: "12345", // missing email, username, image
      });
      const res = mockResponse();
      const next = mockResponse();

      await expect(registerUser(req, res, next)).rejects.toThrow();
    });

    it("should throw 400 error if user already exists", async () => {
      const existingUser = {
        id: "user1",
        githubId: "12345",
        email: "test@example.com",
        username: "testuser",
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const req = mockRequest({}, {
        githubId: "12345",
        email: "test@example.com",
        username: "testuser",
        image: "https://example.com/image.jpg",
      });
      const res = mockResponse();
      const next = mockResponse();

      await expect(registerUser(req, res, next)).rejects.toThrow();
    });

    it("should throw 400 error if user creation fails", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(null);

      const req = mockRequest({}, {
        githubId: "12345",
        email: "test@example.com",
        username: "testuser",
        image: "https://example.com/image.jpg",
      });
      const res = mockResponse();
      const next = mockResponse();

      await expect(registerUser(req, res, next)).rejects.toThrow();
    });
  });

  describe("getUser", () => {
    it("should return user with related data", async () => {
      const mockUser = {
        id: "user1",
        githubId: "12345",
        email: "test@example.com",
        username: "testuser",
        repos: [],
        plan: { id: "free-plan", name: "FREE", price: 0 },
        payments: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const req = mockRequest({}, {}, { id: "user1" });
      const res = mockResponse();
      const next = mockResponse();

      await getUser(req, res, next);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user1" },
        include: {
          repos: true,
          plan: true,
          payments: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: mockUser,
      });
    });

    it("should throw 404 error if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const req = mockRequest({}, {}, { id: "user1" });
      const res = mockResponse();
      const next = mockResponse();

      await expect(getUser(req, res, next)).rejects.toThrow();
    });
  });

  describe("updateUser", () => {
    it("should update user with provided fields", async () => {
      const mockUpdatedUser = {
        id: "user1",
        username: "updateduser",
        email: "updated@example.com",
        image: "https://example.com/updated.jpg",
      };

      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

      const req = mockRequest({}, {}, { id: "user1" });
      req.body = {
        username: "updateduser",
        email: "updated@example.com",
        image: "https://example.com/updated.jpg",
      };
      const res = mockResponse();
      const next = mockResponse();

      await updateUser(req, res, next);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user1" },
        data: {
          username: "updateduser",
          email: "updated@example.com",
          image: "https://example.com/updated.jpg",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: mockUpdatedUser,
      });
    });

    it("should update only provided fields", async () => {
      const mockUpdatedUser = {
        id: "user1",
        username: "updateduser",
        email: "test@example.com", // unchanged
        image: "https://example.com/image.jpg", // unchanged
      };

      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

      const req = mockRequest({}, {}, { id: "user1" });
      req.body = {
        username: "updateduser",
        // email and image not provided
      };
      const res = mockResponse();
      const next = mockResponse();

      await updateUser(req, res, next);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user1" },
        data: {
          username: "updateduser",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: mockUpdatedUser,
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      const req = mockRequest({}, {}, { id: "user1" });
      const res = mockResponse();
      const next = mockResponse();

      await deleteUser(req, res, next);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: "user1" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully",
      });
    });
  });
});