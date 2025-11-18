import { mockPrisma } from "./mockPrisma";
import { mockRequest, mockResponse, mockNext } from "./testUtils";

jest.mock("db/prisma", () => ({
	prisma: mockPrisma,
}));

import {
	createPlan,
	getAllPlans,
	updatePlan,
	deletePlan,
} from "../controllers/plan.controller";

describe("Plan Controller", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("createPlan", () => {
		it("should create a new plan", async () => {
			const mockPlan = {
				id: "plan1",
				name: "Premium",
				price: 29.99,
				maxRepos: 10,
				description: "Premium plan",
			};

			mockPrisma.plan.create.mockResolvedValue(mockPlan);

			const req = mockRequest(
				{},
				{
					name: "Premium",
					price: 29.99,
					maxRepos: 10,
					description: "Premium plan",
				}
			);
			const res = mockResponse();

			await createPlan(req, res, mockResponse());

			expect(mockPrisma.plan.create).toHaveBeenCalledWith({
				data: {
					name: "Premium",
					price: 29.99,
					maxRepos: 10,
					description: "Premium plan",
				},
			});
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				plan: mockPlan,
			});
		});
	});

	describe("getAllPlans", () => {
		it("should return all plans ordered by price", async () => {
			const mockPlans = [
				{
					id: "free-plan",
					name: "Free",
					price: 0,
					maxRepos: 1,
					description: "Free plan",
				},
				{
					id: "premium-plan",
					name: "Premium",
					price: 29.99,
					maxRepos: 10,
					description: "Premium plan",
				},
			];

			mockPrisma.plan.findMany.mockResolvedValue(mockPlans);

			const req = mockRequest();
			const res = mockResponse();
			const next = mockResponse();

			await getAllPlans(req, res, next);

			expect(mockPrisma.plan.findMany).toHaveBeenCalledWith({
				orderBy: {
					price: "asc",
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ plans: mockPlans });
		});
	});

	describe("updatePlan", () => {
		it("should update plan with all provided fields", async () => {
			const mockUpdatedPlan = {
				id: "plan1",
				name: "Updated Premium",
				price: 39.99,
				maxRepos: 20,
				description: "Updated premium plan",
			};

			mockPrisma.plan.update.mockResolvedValue(mockUpdatedPlan);

			const req = mockRequest(
				{ planId: "plan1" },
				{
					name: "Updated Premium",
					price: 39.99,
					maxRepos: 20,
					description: "Updated premium plan",
				}
			);
			const res = mockResponse();
			const next = mockResponse();

			await updatePlan(req, res, next);

			expect(mockPrisma.plan.update).toHaveBeenCalledWith({
				where: { id: "plan1" },
				data: {
					name: "Updated Premium",
					price: 39.99,
					maxRepos: 20,
					description: "Updated premium plan",
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				plan: mockUpdatedPlan,
			});
		});

		it("should update only provided fields", async () => {
			const mockUpdatedPlan = {
				id: "plan1",
				name: "Premium",
				price: 29.99,
				maxRepos: 15,
				description: "Premium plan",
			};

			mockPrisma.plan.update.mockResolvedValue(mockUpdatedPlan);

			const req = mockRequest(
				{ planId: "plan1" },
				{
					maxRepos: 15,
				}
			);
			const res = mockResponse();
			const next = mockResponse();

			await updatePlan(req, res, next);

			expect(mockPrisma.plan.update).toHaveBeenCalledWith({
				where: { id: "plan1" },
				data: {
					maxRepos: 15,
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				plan: mockUpdatedPlan,
			});
		});
	});

	describe("deletePlan", () => {
		it("should delete a plan", async () => {
			const req = mockRequest({ planId: "plan1" });
			const res = mockResponse();
			const next = mockResponse();

			await deletePlan(req, res, next);

			expect(mockPrisma.plan.delete).toHaveBeenCalledWith({
				where: { id: "plan1" },
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: "Plan deleted successfully",
			});
		});
	});
});
