import { mockPrisma } from "./mockPrisma";
import { mockRequest, mockResponse, mockNext } from "./testUtils";

jest.mock("db/prisma", () => ({
	prisma: mockPrisma,
}));

jest.mock("jwt", () => ({
	createToken: jest.fn().mockReturnValue("mocked-token"),
}));

process.env.KHALTI_SECRET_KEY = "test-secret-key";
process.env.KHALTI_GATEWAY_URL = "https://test.khalti.com";

import {
	getAllPayments,
	getPayment,
	createPayment,
	updatePayment,
	deletePayment,
	paymentCallback,
} from "../controllers/payment.controller";

describe("Payment Controller", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getAllPayments", () => {
		it("should return all payments with associated user and plan", async () => {
			const mockPayments = [
				{
					id: "payment1",
					userId: "user1",
					planId: "plan1",
					user: { id: "user1", username: "testuser" },
					plan: { id: "plan1", name: "Premium" },
				},
			];

			mockPrisma.payment.findMany.mockResolvedValue(mockPayments);

			const req = mockRequest();
			const res = mockResponse();
			const next = mockNext();

			await getAllPayments(req, res, next);

			expect(mockPrisma.payment.findMany).toHaveBeenCalledWith({
				include: {
					user: true,
					plan: true,
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				payments: mockPayments,
			});
		});

		it("should handle errors when getting all payments", async () => {
			const consoleSpy = jest.spyOn(console, "log").mockImplementation();

			mockPrisma.payment.findMany.mockRejectedValue(
				new Error("Database error")
			);

			const req = mockRequest();
			const res = mockResponse();
			const next = mockNext();

			getAllPayments(req, res, next);

			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.any(Error));

			consoleSpy.mockRestore();
		});
	});

	describe("getPayment", () => {
		it("should return a payment if found", async () => {
			const mockPayment = {
				id: "payment1",
				userId: "user1",
				planId: "plan1",
				user: { id: "user1", username: "testuser" },
				plan: { id: "plan1", name: "Premium" },
			};

			mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);

			const req = mockRequest({ paymentId: "payment1" });
			const res = mockResponse();
			const next = mockNext();

			await getPayment(req, res, next);

			expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
				where: {
					id: "payment1",
				},
				include: {
					user: true,
					plan: true,
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				payment: mockPayment,
			});
		});

		it("should throw 404 error if payment not found", async () => {
			mockPrisma.payment.findUnique.mockResolvedValue(null);

			const req = mockRequest({ paymentId: "nonexistent" });
			const res = mockResponse();
			const next = mockNext();

			getPayment(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
			expect(mockPrisma.payment.findUnique).toHaveBeenCalled();
		});
	});

	describe("createPayment", () => {
		it("should throw 400 error if planName is not provided", async () => {
			const req = mockRequest({}, { planName: undefined });
			const res = mockResponse();
			const next = mockNext();

			createPayment(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});

		it("should throw 400 error if planName is not a string", async () => {
			const req = mockRequest({}, { planName: 123 });
			const res = mockResponse();
			const next = mockNext();

			createPayment(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});

		it("should throw 404 error if plan not found", async () => {
			mockPrisma.plan.findUnique.mockResolvedValue(null);

			const req = mockRequest({}, { planName: "NonexistentPlan" });
			const res = mockResponse();
			const next = mockNext();

			createPayment(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
			expect(mockPrisma.plan.findUnique).toHaveBeenCalledWith({
				where: { name: "NonexistentPlan" },
			});
		});

		it("should update user plan directly if user has a valid plan or it's a FREE plan", async () => {
			const mockPlan = { id: "plan1", name: "FREE", price: 0 };
			const mockValidPayment = {
				id: "payment1",
				planId: "plan1",
				userId: "user1",
				status: "COMPLETED",
				validUntil: new Date(Date.now() + 86400000),
			}; 

			mockPrisma.plan.findUnique.mockResolvedValue(mockPlan);
			mockPrisma.payment.findFirst.mockResolvedValue(mockValidPayment);

			const req = mockRequest({ user: { id: "user1" } }, { planName: "FREE" });
			const res = mockResponse();
			const next = mockNext();

			createPayment(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: "test-user-id" },
				data: { planName: "FREE", planId: "plan1" },
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				redirect_url: "/dashboard/subscription/payment?success=true&plan=FREE",
			});
		});

		it("should initiate Khalti payment if no valid plan exists", async () => {
			const mockPlan = { id: "premium-plan", name: "Premium", price: 10 };
			const mockFetchResponse = {
				ok: true,
				json: jest.fn().mockResolvedValue({
					payment_url: "https://khalti.com/payment",
					pidx: "pidx-123",
				}),
			};

			mockPrisma.plan.findUnique.mockResolvedValue(mockPlan);
			mockPrisma.payment.findFirst.mockResolvedValue(null);
			global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);
			mockPrisma.payment.create.mockResolvedValue({
				id: "payment1",
				pidx: "pidx-123",
				amount: 10,
				status: "PENDING",
				planId: "premium-plan",
				userId: "user1",
			});

			const req = mockRequest(
				{ user: { id: "user1" } },
				{ planName: "Premium" }
			);
			const res = mockResponse();
			const next = mockNext();

			createPayment(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.payment.create).toHaveBeenCalledWith({
				data: {
					pidx: "pidx-123",
					amount: 10,
					status: "PENDING",
					planId: "premium-plan",
					userId: "test-user-id",
				},
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				payment_url: "https://khalti.com/payment",
			});
		});

		it("should throw 401 error if Khalti payment initiation fails", async () => {
			const mockPlan = { id: "premium-plan", name: "Premium", price: 10 };
			const mockFetchResponse = {
				ok: false,
				status: 401,
				statusText: "Unauthorized",
			};

			mockPrisma.plan.findUnique.mockResolvedValue(mockPlan);
			mockPrisma.payment.findFirst.mockResolvedValue(null);
			global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

			const req = mockRequest(
				{ user: { id: "user1" } },
				{ planName: "Premium" }
			);
			const res = mockResponse();
			const next = mockNext();

			createPayment(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});

		it("should throw 400 error if payment creation fails", async () => {
			const mockPlan = { id: "premium-plan", name: "Premium", price: 10 };
			const mockFetchResponse = {
				ok: true,
				json: jest.fn().mockResolvedValue({
					payment_url: "https://khalti.com/payment",
					pidx: "pidx-123",
				}),
			};

			mockPrisma.plan.findUnique.mockResolvedValue(mockPlan);
			mockPrisma.payment.findFirst.mockResolvedValue(null);
			global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);
			mockPrisma.payment.create.mockResolvedValue(null);

			const req = mockRequest(
				{ user: { id: "user1" } },
				{ planName: "Premium" }
			);
			const res = mockResponse();
			const next = mockNext();

			createPayment(req, res, next);
			await new Promise(process.nextTick);

			expect(next).toHaveBeenCalledWith(expect.anything());
		});
	});

	describe("updatePayment", () => {
		it("should update payment status and amount", async () => {
			const mockUpdatedPayment = {
				id: "payment1",
				status: "COMPLETED",
				amount: 15,
			};

			mockPrisma.payment.update.mockResolvedValue(mockUpdatedPayment);

			const req = mockRequest(
				{ paymentId: "payment1" },
				{ status: "COMPLETED", amount: 15 }
			);
			const res = mockResponse();
			const next = mockNext();

			await updatePayment(req, res, next);

			expect(mockPrisma.payment.update).toHaveBeenCalledWith({
				where: { id: "payment1" },
				data: { status: "COMPLETED", amount: 15 },
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				payment: mockUpdatedPayment,
			});
		});

		it("should update only provided fields", async () => {
			const mockUpdatedPayment = {
				id: "payment1",
				status: "PENDING",
				amount: 10,
			};

			mockPrisma.payment.update.mockResolvedValue(mockUpdatedPayment);

			const req = mockRequest({ paymentId: "payment1" }, { status: "PENDING" });
			const res = mockResponse();
			const next = mockNext();

			await updatePayment(req, res, next);

			expect(mockPrisma.payment.update).toHaveBeenCalledWith({
				where: { id: "payment1" },
				data: { status: "PENDING" },
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				payment: mockUpdatedPayment,
			});
		});
	});

	describe("deletePayment", () => {
		it("should delete a payment", async () => {
			const req = mockRequest({ paymentId: "payment1" });
			const res = mockResponse();
			const next = mockNext();

			await deletePayment(req, res, next);

			expect(mockPrisma.payment.delete).toHaveBeenCalledWith({
				where: { id: "payment1" },
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: "Payment deleted successfully",
			});
		});
	});

	describe("paymentCallback", () => {
		it("should handle successful payment callback", async () => {
			const mockFetchResponse = {
				ok: true,
				json: jest.fn().mockResolvedValue({ status: "Completed" }),
			};

			global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

			const updatePaymentResult = {
				userId: "user1",
				planId: "plan1",
				plan: { name: "Premium" },
			};

			mockPrisma.payment.update.mockResolvedValue(updatePaymentResult);
			mockPrisma.$transaction = jest
				.fn()
				.mockImplementation(async (fn) => await fn());

			const req = mockRequest({}, { pidx: "pidx-123" });
			const res = mockResponse();
			const next = mockNext();

			paymentCallback(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.payment.update).toHaveBeenCalledWith({
				where: { pidx: "pidx-123" },
				data: {
					status: "COMPLETED",
					validUntil: expect.any(Date),
				},
				select: {
					userId: true,
					planId: true,
					plan: {
						select: {
							name: true,
						},
					},
				},
			});
			expect(mockPrisma.user.update).toHaveBeenCalledWith({
				where: { id: "user1" },
				data: { planId: "plan1", planName: "Premium" },
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				message: "Payment successful",
				plan: "Premium",
			});
		});

		it("should handle failed payment callback", async () => {
			const mockFetchResponse = {
				ok: true,
				json: jest.fn().mockResolvedValue({ status: "Failed" }),
			};

			global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

			const req = mockRequest({}, { pidx: "pidx-123" });
			const res = mockResponse();
			const next = mockNext();

			paymentCallback(req, res, next);
			await new Promise(process.nextTick);

			expect(mockPrisma.payment.delete).toHaveBeenCalledWith({
				where: { pidx: "pidx-123" },
			});
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				message: "Payment Failed",
			});
		});
	});
});
