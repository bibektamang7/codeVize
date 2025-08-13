import { createNodeMiddleware } from "@octokit/webhooks";
import { App, Octokit } from "octokit";
import fs from "fs";
import { prisma } from "db/prisma";
import { embedRepoChain, prCodeReviewChain } from "../langflows";
import { deleteEmbededRepo } from "langflows/chains/embedRepo";

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_PRIVATE_KEY_PATH = process.env.GITHUB_PRIVATE_KEY;
const GITHUB_APP_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

const privateKey = fs.readFileSync(GITHUB_APP_PRIVATE_KEY_PATH!, "utf-8");

const githubApp = new App({
	appId: GITHUB_APP_ID!,
	privateKey: privateKey,
	webhooks: {
		secret: GITHUB_APP_WEBHOOK_SECRET!,
	},
});

githubApp.webhooks.on("pull_request", async ({ payload }) => {
	const { owner } = payload.repository;

	let installationId: number | undefined = undefined;

	if ("installation" in payload && payload.installation) {
		installationId = payload.installation.id;
	} else {
		installationId = await getAuthenticatedInstallationId(
			owner.login,
			payload.repository.name
		);
		if (!installationId) {
			console.log("Failed to get installation id here in PR webhook event");
			return;
		}
	}
	await prCodeReviewChain(
		payload.pull_request.id,
		installationId,
		owner.name!,
		payload.repository.name
	);
	//TODO: give diff to LLM for review
});

githubApp.webhooks.on(
	"installation.created",
	async ({ id, octokit, name, payload }) => {
		const installationId = payload.installation.id.toString();
		const githubAccountId = payload.installation.account?.id.toString();
		if (!githubAccountId) return;
		// const user = await prisma.user.findUnique({
		// 	where: { githubId: githubAccountId },
		// });

		// if (!user) {
		// 	console.log("User not found");
		// 	return;
		// }

		try {
			const repos = await octokit.rest.apps.listReposAccessibleToInstallation();
			if (!installationId || repos.data.repositories.length === 0) return;
			//TODO: Handle empty repo
			await embedRepoChain(
				payload.installation.id,
				repos.data.repositories[0]?.owner.login!,
				repos.data?.repositories[0]?.name!
			);
		} catch (error) {
			console.error("Failed to list repos for installation", error);
		}
		// const repoData = repos.data.repositories.map((repo) => ({
		// 	installationId: installationId,
		// 	repoName: repo.name,
		// 	repoFullName: repo.full_name,
		// 	repoURL: repo.html_url,
		// 	repoId: repo.id.toString(),
		// 	userId: user.id,
		// 	languages: [repo.language || ""],
		// }));

		// await prisma.repo.createMany({
		// 	data: repoData,
		// 	skipDuplicates: true,
		// });
	}
);

githubApp.webhooks.on("issues.opened", async ({ id, name, payload }) => {
	const repoId = payload.repository.id.toString();
	try {
		const existedRepo = await prisma.repo.findUnique({
			where: {
				repoId,
			},
		});

		if (!existedRepo) {
			throw new Error("Repo doesn't exists");
		}
		if (!existedRepo.isActive) {
			return;
		}

		//TODO: here now call the LLM for issue tag generation
	} catch (error) {
		console.error("Failed in issue opened", error);
	}
});

githubApp.webhooks.on("installation.deleted", async ({ octokit, payload }) => {
	const installationId = payload.installation.id.toString();
	const repoId = payload.repository?.id.toString();
	if (!installationId || !repoId) {
		console.log("Installation Id or repo id required");
		return;
	}
	try {
		const repo = await prisma.repo.findUnique({
			where: {
				installationId,
				repoId,
			},
		});

		if (!repo) {
			console.error("Repo not found for deletion");
			throw new Error("Repo not found");
		}

		const deletedRepop = await prisma.repo.delete({
			where: {
				id: repo.id,
			},
		});

		if (!deletedRepop) {
			console.error("Failed to delete repo from database");
			throw new Error("Failed to delete repo");
		}
		await deleteEmbededRepo(
			Number(installationId),
			payload.sender.login,
			payload.repository?.name!
		);

		console.log("Repo delete from database successfully");
	} catch (error) {
		console.error("This is the error in the delete installation", error);
		throw new Error("Failed to delete installed app");
	}
	console.log("installed github app is deleted");
});

githubApp.webhooks.onError((error) => {
	if (error.name === "AggregateError") {
		console.error("Error processing request: ", error.event);
	} else {
		console.error(error);
	}
});

async function getAuthenticatedOctokit(
	installationId: number
): Promise<Octokit> {
	const octokit = await githubApp.getInstallationOctokit(installationId);
	return octokit;
}

async function getAuthenticatedInstallationId(owner: string, repoName: string) {
	try {
		const installationResponse = await githubApp.octokit.request(
			`GET /repos/{owner}/{repo}/installation`,
			{
				owner,
				repo: repoName,
			}
		);
		return installationResponse.data.id;
	} catch (error) {
		console.error("Something went wrong while getting installation id");
	}
}
export {
	githubApp,
	getAuthenticatedOctokit,
	createNodeMiddleware,
	getAuthenticatedInstallationId,
};
