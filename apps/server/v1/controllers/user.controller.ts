import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getRepository = async (req: Request, res: Response) => {
	const { repoId } = req.params;
	try {
		const repo = await prisma.repo.findUnique({
			where: {
				id: repoId,
			},
			select: {
				pullRequests: true,
			},
		});
		if (!repoId) {
			console.error("Repo not found");
			res.status(400).json({ messsage: "Repo not found" });
			return;
		}
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
		});
		if (repositories.length === 0) {
			res.status(400).json({ message: "No repositories found" });
			return;
		}
		res.status(200).json(repositories);
		return;
	} catch (error) {
		console.error("Failed to retrieve repositories", error);
		res.status(500).json({ message: "Failed to retrieve repositories" });
	}
};
