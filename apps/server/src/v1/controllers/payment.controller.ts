import type { Request, Response } from "express";
import { prisma } from "db/prisma";
import { ApiError, asyncHandler } from "../utils/apiErrorHandler";

export const getAllPayments = asyncHandler(
	async (req: Request, res: Response) => {
		const payments = await prisma.payment.findMany({
			include: {
				user: true,
				plan: true,
			},
		});

		res.status(200).json({ success: true, payments });
	}
);

export const getPayment = asyncHandler(async (req: Request, res: Response) => {
	const { paymentId } = req.params;

	const payment = await prisma.payment.findUnique({
		where: {
			id: paymentId,
		},
		include: {
			user: true,
			plan: true,
		},
	});

	if (!payment) {
		throw new ApiError(404, "Payment not found");
	}

	res.status(200).json({ success: true, payment });
});

export const createPayment = asyncHandler(
	async (req: Request, res: Response) => {
		const { planName } = req.body;
		const type = typeof planName;
		if (!planName || type !== "string") {
			throw new ApiError(400, "Invalid credentials");
		}
		const plan = await prisma.plan.findUnique({
			where: {
				name: planName,
			},
		});

		if (!plan) {
			throw new ApiError(404, "Plan not found!.");
		}
		const hasValidPlan = await prisma.payment.findFirst({
			where: {
				planId: plan.id,
				userId: req.user.id,
				status: "COMPLETED",
				validUntil: {
					gt: new Date(),
				},
			},
		});

		if (hasValidPlan || plan.name === "FREE") {
			await prisma.user.update({
				where: {
					id: req.user.id,
				},
				data: {
					planName: plan.name,
					planId: plan.id,
				},
			});
			res.status(200).json({
				redirect_url: `/dashboard/subscription/payment?success=true&plan=${plan.name}`,
			});
			return;
		}

		const formData = JSON.stringify({
			return_url: "https://799920e12fcc.ngrok-free.app/api/payment/callback",
			website_url: "http://localhost:3000",
			amount: Number(plan.price) * 100,
			purchase_order_id: plan.id,
			purchase_order_name: req.user.id,
		});

		const headers = {
			Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
			"Content-Type": "application/json",
		};
		console.log("this is url", process.env.KHALTI_GATEWAY_URL);
		const response = await fetch(
			`${process.env.KHALTI_GATEWAY_URL}/epayment/initiate/`,
			{
				headers,
				method: "POST",
				body: formData,
			}
		);
		if (!response.ok) {
			throw new ApiError(401, "Something went wrong");
		}
		const data = (await response.json()) as {
			payment_url: string;
			pidx: string;
		};
		const payment = await prisma.payment.create({
			data: {
				pidx: data.pidx,
				amount: plan.price,
				status: "PENDING",
				planId: plan.id,
				userId: req.user.id,
			},
		});
		if (!payment) {
			throw new ApiError(400, "Failed to process payment");
		}
		res.status(200).json({ payment_url: data.payment_url });
	}
);

export const updatePayment = asyncHandler(
	async (req: Request, res: Response) => {
		const { paymentId } = req.params;
		const { status, amount } = req.body;

		const updatedPayment = await prisma.payment.update({
			where: {
				id: paymentId,
			},
			data: {
				...(status && { status }),
				...(amount && { amount }),
			},
		});

		res.status(200).json({ success: true, payment: updatedPayment });
	}
);

export const deletePayment = asyncHandler(
	async (req: Request, res: Response) => {
		const { paymentId } = req.params;

		await prisma.payment.delete({
			where: {
				id: paymentId,
			},
		});

		res
			.status(200)
			.json({ success: true, message: "Payment deleted successfully" });
	}
);

const addDays = (date: Date, days: number): Date => {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
};

export const paymentCallback = asyncHandler(
	async (req: Request, res: Response) => {
		const { pidx } = req.body;

		const verifyRes = await fetch(
			"https://dev.khalti.com/api/v2/epayment/lookup/",
			{
				method: "POST",
				headers: {
					Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ pidx }),
			}
		);

		const data = (await verifyRes.json()) as any;

		if (data.status === "Completed") {
			let plan: string = "";
			await prisma.$transaction(async () => {
				const updatePayment = await prisma.payment.update({
					where: {
						pidx,
					},
					data: {
						status: "COMPLETED",
						validUntil: addDays(new Date(), 30),
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
				await prisma.user.update({
					where: {
						id: updatePayment.userId,
					},
					data: {
						planId: updatePayment.planId,
						planName: updatePayment.plan.name,
					},
				});
				plan = updatePayment.plan.name;
			});
			res.status(200).json({ message: "Payment successful", plan });
			return;
		}

		await prisma.payment.delete({
			where: {
				pidx,
			},
		});

		res.status(400).json({ message: "Payment Failed" });
	}
);
