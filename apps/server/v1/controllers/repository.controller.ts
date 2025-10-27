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
		res.status(200).json({ success: true, repo });
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
		const updatedRepo = await prisma.repo.update({
			where: {
				id: repo.id,
			},
			data: {
				isActive: false,
			},
		});
		if (!updatedRepo) {
			throw new ApiError(400, "Failed to update repo status");
		}
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

		const updatedRepo = await prisma.repo.update({
			where: {
				id: repo.id,
			},
			data: {
				isActive: true,
			},
		});

		if (!updatedRepo) {
			throw new ApiError(400, "Failed to activate repo");
		}

		// Increment user's active repo count
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

		res.status(200).json({
			success: true,
			message: "Repository activated successfully",
			repo: updatedRepo,
		});
	}
);

export const deleteInstalledRepo = asyncHandler(
	async (req: Request, res: Response) => {
		const { repoId } = req.params;
		const repo = await prisma.repo.findUnique({
			where: {
				id: repoId,
			},
		});

		if (!repo) {
			// Note: The original code was returning 200 for not found - keeping the same behavior
			return res
				.status(200)
				.json({ success: true, message: "Failed to find repo" });
		}
		const installationId = Number(repo.installationId);
		const octokit = await getAuthenticatedOctokit(installationId);

		const response = await octokit.request(
			"DELETE /app/installations/{installation_id}",
			{
				installation_id: installationId,
			}
		);
		if (response.status !== 204) {
			throw new ApiError(500, "Failed to delete installation");
		}
		await prisma.repo.delete({
			where: {
				id: repo.id,
			},
		});

		if (!repo) {
			throw new ApiError(500, "Failed to delete repo from database");
		}
		res
			.status(200)
			.json({ success: true, message: "Repo deleted successfully" });
	}
);

export const updateRepoConfig = asyncHandler(
	async (req: Request, res: Response) => {
		const { repoId } = req.params;
		const { generalConfig, reviewConfig, issueConfig } = req.body;

		const repoConfig = await prisma.repoConfig.findUnique({
			where: { repoId },
		});

		if (!repoConfig) {
			throw new ApiError(404, "Repository configuration not found");
		}

		// Update general config if provided
		if (generalConfig) {
			await prisma.generalConfig.update({
				where: { id: repoConfig.generalConfigId },
				data: generalConfig,
			});
		}

		// Update review config if provided
		if (reviewConfig) {
			await prisma.reviewConfig.update({
				where: { id: repoConfig.reviewConfigId },
				data: reviewConfig,
			});
		}

		// Update issue config if provided
		if (issueConfig) {
			await prisma.issueConfig.update({
				where: { id: repoConfig.issueConfigId },
				data: issueConfig,
			});
		}

		// Return the updated repository configuration
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
