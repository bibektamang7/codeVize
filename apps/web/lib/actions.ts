"use server";

import { prismaClient } from "db/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { revalidatePath } from "next/cache";

// Get all available plans
export async function getAvailablePlans() {
	try {
		const plans = await prismaClient.plan.findMany({
			orderBy: {
				price: "asc",
			},
		});
		return plans;
	} catch (error) {
		console.error("Failed to fetch plans:", error);
		throw new Error("Failed to fetch plans");
	}
}

// Get user's current subscription
export async function getUserSubscription() {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}

	try {
		const user = await prismaClient.user.findUnique({
			where: { id: session.user.id },
			select: {
				planName: true,
				payments: {
					orderBy: { createdAt: "desc" },
					take: 1,
				},
			},
		});

		return user;
	} catch (error) {
		console.error("Failed to fetch user subscription:", error);
		throw new Error("Failed to fetch user subscription");
	}
}

// Create a payment record
export async function createPayment(
	planId: string,
	amount: number,
	status: string
) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}

	try {
		const payment = await prismaClient.payment.create({
			data: {
				userId: session.user.id,
				planId,
				amount,
				status,
			},
			include: {
				plan: true,
			},
		});

		// Update user's plan
		await prismaClient.user.update({
			where: { id: session.user.id },
			data: {
				planName: payment.plan.name,
			},
		});

		revalidatePath("/dashboard/subscription");
		return payment;
	} catch (error) {
		console.error("Failed to create payment:", error);
		throw new Error("Failed to create payment");
	}
}

// Get repositories with error logs
export async function getReposWithErrorLogs() {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}

	try {
		const repos = await prismaClient.repo.findMany({
			where: {
				userId: session.user.id,
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
							take: 1,
							orderBy: { occurredAt: "desc" },
							select: {
								id: true,
								message: true,
								type: true,
								occurredAt: true,
							},
						},
					},
				},
			},
		});

		return repos;
	} catch (error) {
		console.error("Failed to fetch repositories with error logs:", error);
		throw new Error("Failed to fetch repositories with error logs");
	}
}

// Get error logs for a specific repository
export async function getRepoErrorLogs(repoId: string) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}

	try {
		const repo = await prismaClient.repo.findFirst({
			where: {
				id: repoId,
				userId: session.user.id,
			},
			include: {
				repoConfig: {
					include: {
						errorLogs: {
							orderBy: { occurredAt: "desc" },
						},
					},
				},
			},
		});

		return repo;
	} catch (error) {
		console.error("Failed to fetch repository error logs:", error);
		throw new Error("Failed to fetch repository error logs");
	}
}

// Mark an error log as resolved
export async function markErrorLogAsResolved(errorLogId: string) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}

	try {
		const updatedErrorLog = await prismaClient.repoErrorLog.update({
			where: {
				id: errorLogId,
				repoConfig: {
					repo: {
						userId: session.user.id,
					},
				},
			},
			data: {
				resolved: true,
			},
		});

		// Use a more appropriate path for revalidation
		revalidatePath(`/dashboard/error-logs/${updatedErrorLog}`);
		return updatedErrorLog;
	} catch (error) {
		console.error("Failed to mark error log as resolved:", error);
		throw new Error("Failed to mark error log as resolved");
	}
}
