import { mockPrisma } from "./mockPrisma";
import { mockRequest, mockResponse, mockNext } from "./testUtils";

jest.mock("db/prisma", () => ({
	prisma: mockPrisma,
}));

jest.mock("github-config", () => ({
	getAuthenticatedOctokit: jest.fn(),
}));

import {
	getRepository,
	getAllRepositories,
	deactivateRepository,
	activateRepository,
	updateRepoConfig,
	getRepositoriesLogs,
} from "../controllers/repository.controller";

describe("Repository Controller", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getRepository", () => {
		it("should return a repository with configurations", async () => {
			const mockRepo = {
				id: "repo1",
				repoName: "test-repo",
				isActive: true,
				repoConfig: {
					id: "config1",
					generalConfig: { id: "gen1", tone: "professional" },
					issueConfig: { id: "issue1", issueEnabled: true },
					reviewConfig: { id: "review1", aiReviewEnabled: true },
				},
			};

			mockPrisma.repo.findUnique.mockResolvedValue(mockRepo);

			const req = mockRequest({ repoId: "repo1" });
			const res = mockResponse();
			const next = mockNext();

			getRepository(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.repo.findUnique).toHaveBeenCalledWith({
				where: { id: "repo1" },
				include: {
					repoConfig: {
						include: {
							generalConfig: true,
							issueConfig: true,
							reviewConfig: true,
						},
					},
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ repo: mockRepo });
		});

		it("should throw 404 error if repository not found", async () => {
			mockPrisma.repo.findUnique.mockResolvedValue(null);

			const req = mockRequest({ repoId: "nonexistent" });
			const res = mockResponse();

			const next = mockNext();

			getRepository(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});
	});

	describe("getAllRepositories", () => {
		it("should return all repositories for the user", async () => {
			const mockRepos = [
				{ id: "repo1", repoName: "repo1", isActive: true },
				{ id: "repo2", repoName: "repo2", isActive: false },
			];

			mockPrisma.repo.findMany.mockResolvedValue(mockRepos);

			const req = mockRequest({}, {}, { id: "user1" });
			const res = mockResponse();

			const next = mockNext();
			getAllRepositories(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.repo.findMany).toHaveBeenCalledWith({
				where: { userId: "user1" },
				select: {
					repoName: true,
					id: true,
					isActive: true,
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				repositories: mockRepos,
			});
		});

		it("should return empty array if no repositories found", async () => {
			mockPrisma.repo.findMany.mockResolvedValue([]);

			const req = mockRequest({}, {}, { id: "user1" });
			const res = mockResponse();
			const next = mockNext();

			getAllRepositories(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.repo.findMany).toHaveBeenCalledWith({
				where: { userId: "user1" },
				select: {
					repoName: true,
					id: true,
					isActive: true,
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				repositories: [],
			});
		});
	});

	describe("deactivateRepository", () => {
		it("should deactivate a repository", async () => {
			const mockRepo = { id: "repo1", userId: "user1" };
			mockPrisma.repo.findUnique.mockResolvedValue(mockRepo);
			mockPrisma.$transaction.mockImplementation(async (callback) => await callback(mockPrisma));

			const req = mockRequest({ repoId: "repo1" }, {}, { id: "user1" });
			const res = mockResponse();
			const next = mockNext();

			deactivateRepository(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.repo.findUnique).toHaveBeenCalledWith({
				where: { id: "repo1" },
			});
			expect(mockPrisma.$transaction).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: "Repository uninstalled successfully",
			});
		});

		it("should throw 400 error if repository not found", async () => {
			mockPrisma.repo.findUnique.mockResolvedValue(null);

			const req = mockRequest({ repoId: "nonexistent" }, {}, { id: "user1" });
			const res = mockResponse();

			const next = mockNext();
			deactivateRepository(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});
	});

	describe("activateRepository", () => {
		it("should activate a repository", async () => {
			const mockRepo = { id: "repo1", userId: "user1" };
			mockPrisma.repo.findUnique.mockResolvedValue(mockRepo);
			mockPrisma.$transaction.mockImplementation(async (fn) => await fn());

			const req = mockRequest(
				{ repoId: "repo1" },
				{},
				{
					id: "user1",
					activeRepos: 0,
					plan: {
						id: "free-plan-id",
						name: "FREE",
						price: 0,
						maxRepos: 5, 
						description: "Free plan",
						createdAt: new Date(),
						updatedAt: new Date(),
					}
				}
			);
			const res = mockResponse();
			const next = mockNext();

			activateRepository(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.repo.findUnique).toHaveBeenCalledWith({
				where: { id: "repo1", userId: "user1" },
			});
			expect(mockPrisma.$transaction).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: "Repository activated successfully",
			});
		});



		it("should throw 403 error if user has reached maximum repositories", async () => {
			const req = mockRequest(
				{ repoId: "repo1" },
				{},
				{
					id: "user1",
					activeRepos: 5,
				}
			);
			const res = mockResponse();
			const next = mockNext();

			activateRepository(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});

		it("should throw 404 error if repository not found", async () => {
			mockPrisma.repo.findUnique.mockResolvedValue(null);

			const req = mockRequest(
				{ repoId: "nonexistent" },
				{},
				{
					id: "user1",
					activeRepos: 0,
				}
			);
			const res = mockResponse();
			const next = mockNext();

			activateRepository(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});
	});

	describe("updateRepoConfig", () => {
		it("should update repository configuration", async () => {
			const mockRepoConfig = {
				id: "config1",
				generalConfigId: "gen1",
				issueConfigId: "issue1",
				reviewConfigId: "review1",
			};
			const mockRepo = {
				id: "repo1",
				repoConfig: {
					generalConfig: { id: "gen1", tone: "professional" },
					issueConfig: { id: "issue1", issueEnabled: true },
					reviewConfig: { id: "review1", aiReviewEnabled: true },
				},
			};

			mockPrisma.repoConfig.findUnique.mockResolvedValue(mockRepoConfig);
			mockPrisma.generalConfig.update.mockResolvedValue({
				id: "gen1",
				tone: "casual",
			});
			mockPrisma.reviewConfig.update.mockResolvedValue({
				id: "review1",
				aiReviewEnabled: false,
			});
			mockPrisma.issueConfig.update.mockResolvedValue({
				id: "issue1",
				issueEnabled: false,
			});
			mockPrisma.repo.findUnique.mockResolvedValue(mockRepo);

			const req = mockRequest(
				{ repoId: "repo1" },
				{
					generalConfig: { tone: "casual" },
					reviewConfig: { aiReviewEnabled: false },
					issueConfig: { issueEnabled: false },
					repoConfigId: "config1",
				}
			);
			const res = mockResponse();

			const next = mockNext();
			updateRepoConfig(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.repoConfig.findUnique).toHaveBeenCalledWith({
				where: { id: "config1" },
			});
			expect(mockPrisma.generalConfig.update).toHaveBeenCalledWith({
				where: { id: "gen1" },
				data: { tone: "casual" },
			});
			expect(mockPrisma.reviewConfig.update).toHaveBeenCalledWith({
				where: { id: "review1" },
				data: { aiReviewEnabled: false },
			});
			expect(mockPrisma.issueConfig.update).toHaveBeenCalledWith({
				where: { id: "issue1" },
				data: { issueEnabled: false },
			});
			expect(mockPrisma.repo.findUnique).toHaveBeenCalledWith({
				where: { id: "repo1" },
				include: {
					repoConfig: {
						include: {
							generalConfig: true,
							issueConfig: true,
							reviewConfig: true,
						},
					},
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				repo: mockRepo,
			});
		});

		it("should throw 404 error if repository configuration not found", async () => {
			mockPrisma.repoConfig.findUnique.mockResolvedValue(null);

			const req = mockRequest(
				{ repoId: "repo1" },
				{
					generalConfig: { tone: "casual" },
					repoConfigId: "nonexistent",
				}
			);
			const res = mockResponse();
			const next = mockNext();

			updateRepoConfig(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});

		it("should throw 404 error if repository not found after update", async () => {
			const mockRepoConfig = {
				id: "config1",
				generalConfigId: "gen1",
				issueConfigId: "issue1",
				reviewConfigId: "review1",
			};

			mockPrisma.repoConfig.findUnique.mockResolvedValue(mockRepoConfig);
			mockPrisma.generalConfig.update.mockResolvedValue({
				id: "gen1",
				tone: "casual",
			});
			mockPrisma.repo.findUnique.mockResolvedValue(null); 

			const req = mockRequest(
				{ repoId: "repo1" },
				{
					generalConfig: { tone: "casual" },
					repoConfigId: "config1",
				}
			);
			const res = mockResponse();

			const next = mockNext();
			updateRepoConfig(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});
	});

	describe("getRepositoriesLogs", () => {
		it("should return repositories with error logs", async () => {
			const mockRepos = [
				{
					id: "repo1",
					repoConfig: {
						errorLogs: [
							{
								id: "error1",
								message: "Test error",
								type: "API_ERROR",
								number: 1,
								occurredAt: new Date(),
								resolved: false,
							},
						],
					},
				},
			];

			mockPrisma.repo.findMany.mockResolvedValue(mockRepos);

			const req = mockRequest({}, {}, { id: "user1" });
			const res = mockResponse();

			const next = mockNext();
			getRepositoriesLogs(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.repo.findMany).toHaveBeenCalledWith({
				where: {
					userId: "user1",
					repoConfig: {
						errorLogs: {
							some: {},
						},
					},
				},
				include: {
					repoConfig: {
						select: {
							errorLogs: {
								orderBy: { occurredAt: "desc" },
								select: {
									id: true,
									message: true,
									type: true,
									number: true,
									occurredAt: true,
									resolved: true,
								},
							},
						},
					},
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ repos: mockRepos });
		});
	});
});
