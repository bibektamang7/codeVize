import type { Request, Response } from "express";
import { prisma } from "db/prisma";
import { ApiError, asyncHandler } from "../utils/apiErrorHandler";

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
	const newPlan = await prisma.plan.create({
		data: { ...req.body },
	});

	res.status(201).json({ success: true, plan: newPlan });
});

export const getAllPlans = asyncHandler(async (req: Request, res: Response) => {
	const plans = await prisma.plan.findMany({
		orderBy: {
			price: "asc",
		},
	});
	res.status(200).json({ plans });
});
export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
	const { planId } = req.params;
	const { name, price, maxRepos, description } = req.body;

	const updatedPlan = await prisma.plan.update({
		where: {
			id: planId,
		},
		data: {
			...(name && { name }),
			...(price && { price }),
			...(maxRepos && { maxRepos }),
			...(description && { description }),
		},
	});

	res.status(200).json({ success: true, plan: updatedPlan });
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
	const { planId } = req.params;

	await prisma.plan.delete({
		where: {
			id: planId,
		},
	});

	res.status(200).json({ success: true, message: "Plan deleted successfully" });
});
