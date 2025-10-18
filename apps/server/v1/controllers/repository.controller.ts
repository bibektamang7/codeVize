import type { Request, Response } from "express";
import { prisma } from "db/prisma";
import { getAuthenticatedOctokit } from "github-config";


export const getRepository = async (req: Request, res: Response) => {
	const { repoId } = req.params;
	try {
		const repo = await prisma.repo.findUnique({
			where: {
				id: repoId,
			},
			include: {
				pullRequests: true,
				repoConfig: {
					include: {
						generalConfig: true,
						reviewConfig: {
							include: {
								pathConfigs: true,
								labelConfigs: true
							}
						}
					}
				}
			},
		});
		if (!repo) {
			console.error("Repo not found");
			res.status(404).json({ message: "Repo not found" });
			return;
		}
		res.status(200).json({ repo });
		return;
	} catch (error) {
		console.error("Failed to retrieve repository", error);
		res.status(500).json({ message: "Failed to retrieve repository" });
	}
};

export const getAllRepositories = async (req: Request, res: Response) => {
	try {
		const repositories = await prisma.repo.findMany({
			where: {
				userId: req.user.id,
			},
			include: {
				repoConfig: true
			},
		});
		res.status(200).json({ repositories });
		return;
	} catch (error) {
		console.error("Failed to retrieve repositories", error);
		res.status(500).json({ message: "Failed to retrieve repositories" });
	}
};

export const deactivateRepository = async (req: Request, res: Response) => {
	const { repoId } = req.params;
	try {
		const repo = await prisma.repo.findUnique({
			where: {
				id: repoId,
			},
		});

		if (!repo) {
			console.error("Repo not found");
			res.status(400).json({ messsage: "Repo not found" });
			return;
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
			console.error("Failed to update repo status");
			res.status(400).json({ message: "Failed to update repo status" });
			return;
		}
		res.status(200).json({ message: "Repository uninstalled successfully" });
		return;
	} catch (error) {
		console.error("Failed to uninstall repository", error);
		res.status(500).json({ messsage: "Failed to uninstall repository" });
	}
};
export const activateRepository = async (req: Request, res: Response) => {
	if (req.user.plan.maxRepos <= req.user.activeRepos) {
		return res.status(403).json({
			message: "You have reached the maximum number of repositories for your plan.",
		});
	}
	const { repoId } = req.params;
	try {
		const repo = await prisma.repo.findUnique({
			where: {
				id: repoId,
				userId: req.user.id
			},
		});
		if (!repo) {
			console.error("Repo not found");
			res.status(404).json({ message: "Repo not found" });
			return;
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
			console.error("Failed to activate repo");
			res.status(400).json({ message: "Failed to activate repo" });
			return;
		}

		// Increment user's active repo count
		await prisma.user.update({
			where: {
				id: req.user.id
			},
			data: {
				activeRepos: {
					increment: 1
				}
			}
		});

		res.status(200).json({ message: "Repository activated successfully", repo: updatedRepo });
		return;
	} catch (error) {
		console.error("Failed to activate repository", error);
		res.status(500).json({ message: "Failed to activate repository" });
	}
};

export const deleteInstalledRepo = async (req: Request, res: Response) => {
	const { repoId } = req.params;
	try {
		const repo = await prisma.repo.findUnique({
			where: {
				id: repoId,
			},
		});

		if (!repo) {
			console.error("Repo not found");
			res.status(200).json({ message: "Failed to find repo" });
			return;
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
			console.error("Failed to delete installation");
			res.status(500).json({ message: "Failed to delete installation" });
			return;
		}
		await prisma.repo.delete({
			where: {
				id: repo.id,
			},
		});

		if (!repo) {
			console.error("Failed to delete repo from database");
			res.status(500).json({ message: "Failed to delete repo" });
			return;
		}
		res.status(200).json({ messsage: "Repo deleted successfully" });
		return;
	} catch (error) {
		console.error("Error deleting installed repo:", error);

		res.status(500).json({ message: "Failed to delete installed repo" });
	}
};
