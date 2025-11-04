import type { Request, Response } from "express";
import { prisma } from "db/prisma";
import { getAuthenticatedOctokit } from "github-config";
import { ApiError, asyncHandler } from "../utils/apiErrorHandler";

export const getRepository = asyncHandler(
	async (req: Request, res: Response) => {
		const { repoId } = req.params;
		const repo = await prisma.repo.findUnique({
			where: {
				id: repoId,
			},
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
		if (!repo) {
			throw new ApiError(404, "Repo not found");
		}
		res.status(200).json({ repo });
		return;
	}
);

export const getAllRepositories = asyncHandler(
	async (req: Request, res: Response) => {
		const repositories = await prisma.repo.findMany({
			where: {
				userId: req.user.id,
			},
			select: {
				repoName: true,
				id: true,
				isActive: true,
			},
		});
		res.status(200).json({ success: true, repositories: repositories || [] });
	}
);

export const deactivateRepository = asyncHandler(
	async (req: Request, res: Response) => {
		const { repoId } = req.params;
		const repo = await prisma.repo.findUnique({
			where: {
				id: repoId,
			},
		});

		if (!repo) {
			throw new ApiError(400, "Repo not found");
		}
		await prisma.$transaction(async (tx) => {
			await tx.repo.update({
				where: {
					id: repo.id,
				},
				data: {
					isActive: false,
				},
			});
			await tx.user.update({
				where: { id: req.user.id },
				data: {
					activeRepos: {
						decrement: 1,
					},
				},
			});
		});
		res
			.status(200)
			.json({ success: true, message: "Repository uninstalled successfully" });
	}
);

export const activateRepository = asyncHandler(
	async (req: Request, res: Response) => {
		if (req.user.plan.maxRepos <= req.user.activeRepos) {
			throw new ApiError(
				403,
				"You have reached the maximum number of repositories for your plan."
			);
		}
		const { repoId } = req.params;
		const repo = await prisma.repo.findUnique({
			where: {
				id: repoId,
				userId: req.user.id,
			},
		});
		if (!repo) {
			throw new ApiError(404, "Repo not found");
		}

		await prisma.$transaction(async (tx) => {
			await prisma.repo.update({
				where: {
					id: repo.id,
				},
				data: {
					isActive: true,
				},
			});

			await prisma.user.update({
				where: {
					id: req.user.id,
				},
				data: {
					activeRepos: {
						increment: 1,
					},
				},
			});
		});

		res.status(200).json({
			success: true,
			message: "Repository activated successfully",
		});
	}
);

export const updateRepoConfig = asyncHandler(
	async (req: Request, res: Response) => {
		const { repoId } = req.params;
		const { generalConfig, reviewConfig, issueConfig, repoConfigId } = req.body;

		const repoConfig = await prisma.repoConfig.findUnique({
			where: { id: repoConfigId },
		});
		console.log("thjis is repo config", repoConfig);
		if (!repoConfig) {
			throw new ApiError(404, "Repository configuration not found");
		}

		if (generalConfig) {
			const generalConfiged = await prisma.generalConfig.update({
				where: { id: repoConfig.generalConfigId },
				data: {
					...(generalConfig.tone !== undefined && { tone: generalConfig.tone }),
					...(generalConfig.enableFreeTier !== undefined && {
						enableFreeTier: generalConfig.enableFreeTier,
					}),
					...(generalConfig.earlyAccess !== undefined && {
						earlyAccess: generalConfig.earlyAccess,
					}),
					...(generalConfig.defaultModel !== undefined && {
						defaultModel: generalConfig.defaultModel,
					}),
					...(generalConfig.contextDepth !== undefined && {
						contextDepth: generalConfig.contextDepth,
					}),
				},
			});
		}

		if (reviewConfig) {
			await prisma.reviewConfig.update({
				where: { id: repoConfig.reviewConfigId },
				data: {
					...(reviewConfig.aiReviewEnabled !== undefined && {
						aiReviewEnabled: reviewConfig.aiReviewEnabled,
					}),
					...(reviewConfig.highLevelSummaryEnabled !== undefined && {
						highLevelSummaryEnabled: reviewConfig.highLevelSummaryEnabled,
					}),
					...(reviewConfig.showWalkThrough !== undefined && {
						showWalkThrough: reviewConfig.showWalkThrough,
					}),
					...(reviewConfig.abortOnClose !== undefined && {
						abortOnClose: reviewConfig.abortOnClose,
					}),
					...(reviewConfig.isProgressFortuneEnabled !== undefined && {
						isProgressFortuneEnabled: reviewConfig.isProgressFortuneEnabled,
					}),
					...(reviewConfig.poemEnabled !== undefined && {
						poemEnabled: reviewConfig.poemEnabled,
					}),
				},
			});
		}

		if (issueConfig) {
			await prisma.issueConfig.update({
				where: { id: repoConfig.issueConfigId },
				data: {
					...(issueConfig.aiIssueTriageEnabled !== undefined && {
						aiIssueTriageEnabled: issueConfig.aiIssueTriageEnabled,
					}),
					...(issueConfig.issueEmbedEnabled !== undefined && {
						issueEmbedEnabled: issueConfig.issueEmbedEnabled,
					}),
					...(issueConfig.issueEnabled !== undefined && {
						issueEnabled: issueConfig.issueEnabled,
					}),
				},
			});
		}

		const updatedRepo = await prisma.repo.findUnique({
			where: { id: repoId },
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

		if (!updatedRepo) {
			throw new ApiError(404, "Repo not found");
		}

		res.status(200).json({ success: true, repo: updatedRepo });
	}
);

export const getRepositoriesLogs = asyncHandler(
	async (req: Request, res: Response) => {
		const repos = await prisma.repo.findMany({
			where: {
				userId: req.user.id,
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

		res.status(200).json({ repos });
		return;
	}
);
