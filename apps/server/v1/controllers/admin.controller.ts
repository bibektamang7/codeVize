import type { Request, Response } from "express";
import { prisma } from "db/prisma";
import { ApiError, asyncHandler } from "../utils/apiErrorHandler";

export const getAdminDashboardStats = asyncHandler(
	async (req: Request, res: Response) => {
		const [
			totalUsers,
			activeRepositories,
			totalPayments,
			newRegisteredUser,
			newRepositoryAdded,
			paymentReceived,
			pendingPaymentsCount,
			totalTokensResult,
		] = await Promise.all([
			prisma.user.count(),
			prisma.repo.count({ where: { isActive: true } }),
			prisma.payment.count(),
			prisma.user.findFirst({
				orderBy: { createdAt: "desc" },
				select: {
					createdAt: true,
					username: true,
				},
			}),
			prisma.repo.findFirst({
				orderBy: { createdAt: "desc" },
				select: {
					repoName: true,
					createdAt: true,
					user: { select: { username: true } },
				},
			}),
			prisma.payment.findFirst({
				where: { status: "COMPLETED" },
				orderBy: { createdAt: "desc" },
				select: { createdAt: true, amount: true },
			}),
			prisma.payment.count({ where: { status: "PENDING" } }),
			prisma.user.aggregate({
				_sum: { tokenCount: true },
			}),
		]);

		const totalTokensUsed = totalTokensResult._sum.tokenCount ?? 0;

		res.status(200).json({
			success: true,
			activity: {
				newUser: newRegisteredUser,
				newRepositoryAdded,
				paymentReceived,
				pendingPaymentsCount,
			},
			stats: {
				totalTokensUsed,
				activeRepositories,
				totalUsers,
				totalPayments,
			},
		});
	}
);

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
	const { page = 1, limit = 10, search } = req.query;

	const skip = (Number(page) - 1) * Number(limit);

	const whereClause: any = {};
	if (search) {
		whereClause.OR = [
			{ username: { contains: String(search), mode: "insensitive" } },
			{ email: { contains: String(search), mode: "insensitive" } },
			{ id: { contains: String(search), mode: "insensitive" } },
		];
	}

	const users = await prisma.user.findMany({
		where: whereClause,
		skip,
		take: Number(limit),
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			githubId: true,
			username: true,
			email: true,
			image: true,
			activeRepos: true,
			planName: true,
			createdAt: true,
		},
	});

	const total = await prisma.user.count({ where: whereClause });

	res.status(200).json({
		success: true,
		users,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total,
			pages: Math.ceil(total / Number(limit)),
		},
	});
});


export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
	const { userId } = req.params;

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// Delete related data first due to foreign key constraints
	await prisma.payment.deleteMany({
		where: {
			userId: userId,
		},
	});

	await prisma.repo.deleteMany({
		where: {
			userId: userId,
		},
	});

	// Finally delete the user
	await prisma.user.delete({
		where: {
			id: userId,
		},
	});

	res.status(200).json({
		success: true,
		message: "User deleted successfully",
	});
});

export const getAllRepositories = asyncHandler(
	async (req: Request, res: Response) => {
		const { page = 1, limit = 10, search } = req.query;

		const skip = (Number(page) - 1) * Number(limit);

		const whereClause: any = {};
		if (search) {
			whereClause.OR = [
				{ repoName: { contains: String(search), mode: "insensitive" } },
				{ repoFullName: { contains: String(search), mode: "insensitive" } },
				{ repoId: { contains: String(search), mode: "insensitive" } },
			];
		}

		const repositories = await prisma.repo.findMany({
			where: whereClause,
			skip,
			take: Number(limit),
			orderBy: {
				createdAt: "desc",
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});

		const total = await prisma.repo.count({ where: whereClause });

		res.status(200).json({
			success: true,
			repositories,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	}
);

export const deleteRepository = asyncHandler(
	async (req: Request, res: Response) => {
		const { repoId } = req.params;

		const repository = await prisma.repo.findUnique({
			where: {
				id: repoId,
			},
		});

		if (!repository) {
			throw new ApiError(404, "Repository not found");
		}

		await prisma.repo.delete({
			where: {
				id: repoId,
			},
		});

		res.status(200).json({
			success: true,
			message: "Repository deleted successfully",
		});
	}
);

export const getAllPayments = asyncHandler(
	async (req: Request, res: Response) => {
		const { page = 1, limit = 10, search, status } = req.query;

		const skip = (Number(page) - 1) * Number(limit);

		const whereClause: any = {};
		if (search) {
			whereClause.OR = [
				{ pidx: { contains: String(search), mode: "insensitive" } },
				{ userId: { contains: String(search), mode: "insensitive" } },
			];
		}

		if (status) {
			whereClause.status = String(status);
		}

		const payments = await prisma.payment.findMany({
			where: whereClause,
			skip,
			take: Number(limit),
			orderBy: {
				createdAt: "desc",
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
					},
				},
				plan: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		const total = await prisma.payment.count({ where: whereClause });

		res.status(200).json({
			success: true,
			payments,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit)),
			},
		});
	}
);
