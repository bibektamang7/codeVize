import { prisma } from "db/prisma";

export const deleteEmbedRepo = async ({
	installationId,
	repoId,
	repoName,
	owner,
}: {
	installationId: number;
	repoId: string;
	repoName: string;
	owner: string;
}) => {
	console.log(`Cleaning up resources for ${owner}/${repoName}...`);
	try {
		try {
			await prisma.repo.delete({
				where: { repoId, installationId: String(installationId) },
			});
			console.log(" Repo record removed from DB");
		} catch (err: any) {
			if (err.code === "P2025") {
				console.log("️Repo not found in DB, skipping");
			} else {
				console.error("Error deleting repo from DB:", err);
			}
		}

		console.log(`Cleanup completed for ${owner}/${repoName}`);
	} catch (error) {
		console.error(`Cleanup failed for ${owner}/${repoName}:`, error);
	}
};
