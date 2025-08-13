import type { Request, Response } from "express";
import { prisma } from "db/prisma";
import { getAuthenticatedOctokit } from "github-config";

export const uninstallRepository = async (req: Request, res: Response) => {
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
export const installRepository = async (req: Request, res: Response) => {
	if (req.user.plan.maxRepos <= req.user.activeRepos) {
		res.status(403).json({
			message:
				"You have reached the maximum number of repositories for your plan.",
		});
	}
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
		// const updatedRepo = await prisma.repo.update({
		// 	where: {
		// 		id: repo.id,
		// 	},
		// 	data: {
		// 		isActive: true,
		// 	},
		// });

		// if (!updatedRepo) {
		// 	console.error("Failed to install repo");
		// 	res.status(400).json({ messsage: "Failed to install repo" });
		// 	return;
		// }

		res.status(200).json({ message: "Installing Repository" });
		return;
	} catch (error) {
		console.error("Failed to install repository", error);
		res.status(500).json({ messsage: "Failed to install repository" });
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
