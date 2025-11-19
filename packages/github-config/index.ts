import { createNodeMiddleware } from "@octokit/webhooks";
import { App, Octokit } from "octokit";
import { prisma } from "db/prisma";
import type { Endpoints } from "@octokit/types";
import { logger } from "logger";
import {
	enqueueReview,
	deleteEmbedding,
	issueTriageSuggestion,
} from "bullmq-shared";

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

const privateKey = process.env.GITHUB_PRIVATE_KEY!;

const githubApp = new App({
	appId: GITHUB_APP_ID!,
	privateKey: privateKey,
	webhooks: {
		secret: GITHUB_APP_WEBHOOK_SECRET!,
	},
});

const createRepos = async (octokit: any, payload: any) => {
	try {
		const installationId = payload.installation.id?.toString();
		const githubAccountId = payload.installation.account?.id?.toString();

		if (!installationId || !githubAccountId) {
			logger.warn("Missing installation or GitHub account ID");
			return;
		}

		const user = await prisma.user.findUnique({
			where: { githubId: githubAccountId },
			include: {
				plan: true,
			},
		});

		if (!user) {
			logger.warn("User not found", { githubAccountId });
			return;
		}

		const reposResponse =
			await octokit.rest.apps.listReposAccessibleToInstallation();
		const repositories = reposResponse.data.repositories;

		if (repositories.length === 0) {
			logger.info("No repositories found", { installationId });
			return;
		}

		const getConfigFromPlan = (plan: typeof user.plan) => ({
			generalConfig: {
				enableFreeTier: plan.name !== "FREE",
				earlyAccess: plan.pathConfigCustomization,
				defaultModel:
					plan.name === "ENTERPRISE" ? "gpt-4" : "openai/gpt-oss-120b",
				contextDepth: plan.maxMonthlyReview,
			},
			reviewConfig: {
				aiReviewEnabled: plan.aiReviewEnabled,
				highLevelSummaryEnabled: true,
				showWalkThrough: true,
				abortOnClose: true,
				isProgressFortuneEnabled: plan.aiIssueTriageEnabled,
				poemEnabled: plan.name !== "FREE",
			},
			issueConfig: {
				aiIssueTriageEnabled: plan.aiIssueTriageEnabled,
				issueEmbedEnabled: plan.issueEmbedEnabled,
				issueEnabled: plan.name !== "FREE",
			},
		});
		await prisma.$transaction(async (tx) => {
			for (const repo of repositories) {
				const configDefault = getConfigFromPlan(user.plan);
				await tx.repo.upsert({
					where: { repoId: repo.id.toString() },
					update: {},
					create: {
						repoId: repo.id.toString(),
						repoName: repo.name,
						repoFullName: repo.full_name,
						repoURL: repo.html_url,
						languages: [repo.language || ""],
						installationId,
						isActive: false,
						userId: user.id,
						repoConfig: {
							create: {
								generalConfig: { create: configDefault.generalConfig },
								issueConfig: { create: configDefault.issueConfig },
								reviewConfig: { create: configDefault.reviewConfig },
							},
						},
					},
				});
			}
		});
		logger.info("Repo creation job queued", {
			userId: user.id,
			repoCount: repositories.length,
		});
	} catch (error) {
		logger.error("Error in installation.created webhook", error);
	}
};

githubApp.webhooks.on(
	"installation_repositories.added",
	async ({ octokit, payload }) => {
		await createRepos(octokit, payload);
	}
);
githubApp.webhooks.on(
	"installation_repositories.removed",
	async ({ octokit, payload }) => {
		try {
			const installationId = payload.installation.id?.toString();
			const githubAccountId = payload.installation.account?.id?.toString();

			if (!installationId || !githubAccountId) {
				logger.warn("Missing installation or GitHub account ID");
				return;
			}

			const user = await prisma.user.findUnique({
				where: { githubId: githubAccountId },
				include: {
					plan: true,
				},
			});

			if (!user) {
				logger.warn("User not found", { githubAccountId });
				return;
			}
			logger.info("User found", user.email);

			const reposResponse =
				await octokit.rest.apps.listReposAccessibleToInstallation();
			const repositories = reposResponse.data.repositories;

			if (repositories.length === 0) {
				logger.info("No repositories found", { installationId });
				return;
			}

			console.log("number of repo to create", repositories.length);

			await prisma.$transaction(async (tx) => {
				let activeRepoCounts = 0;
				for (const repo of repositories) {
					const deletedRepo = await tx.repo.delete({
						where: {
							repoId: String(repo.id),
						},
					});
					activeRepoCounts += deletedRepo.isActive ? 1 : 0;
				}
				if (user.activeRepos > 0 && activeRepoCounts > 0) {
					await tx.user.update({
						where: {
							id: user.id,
						},
						data: {
							activeRepos: user.activeRepos - activeRepoCounts,
						},
					});
				}
			});
			logger.info("Repo creation job queued", {
				userId: user.id,
				repoCount: repositories.length,
			});
		} catch (error) {
			logger.error("Error in repo removed", error);
		}
	}
);

githubApp.webhooks.on("installation.created", async ({ octokit, payload }) => {
	await createRepos(octokit, payload);
});

githubApp.webhooks.on("installation.deleted", async ({ octokit, payload }) => {
	const installationId = payload.installation.id.toString();

	try {
		const repos: { id: number; name: string; full_name: string }[] = [];

		if (payload.repositories?.length) {
			repos.push(...payload.repositories);
		}

		if (payload.repository) {
			repos.push(payload.repository);
		}

		if (repos.length > 0) {
			for (const repo of repos) {
				const owner = repo.full_name.split("/")[0] || payload.sender.login;
				const repoName = repo.name;

				await deleteEmbedding({
					installationId: Number(installationId),
					repoId: String(repo.id),
					owner,
					repoName,
				});
			}
		} else {
			await prisma.repo.deleteMany({
				where: { installationId },
			});
		}
	} catch (error) {
		console.error("Error deleting installation:", error);
	}
});

//TODO: ENABLE_LATER
// githubApp.webhooks.on("pull_request.synchronize", ({ octokit, payload }) => {
// 	console.log("Pull request changes");
// });

const isTestMode = process.env.TEST_MODE === "simulate" || false;
const getInstallationId = (owner: string, repoName: string) => {
	if (isTestMode) {
		return 12345;
	}
	return getAuthenticatedInstallationId(owner, repoName);
};

githubApp.webhooks.on("pull_request.opened", async ({ payload }) => {
	try {
		const { owner } = payload.repository;

		let installationId: number | undefined =
			process.env.TEST_MODE === "simulate" ? 12345 : undefined;

		if ("installation" in payload && payload.installation) {
			installationId = payload.installation.id;
		} else {
			installationId = await getInstallationId(
				owner.login,
				payload.repository.name
			);
			if (!installationId) {
				console.log("Failed to get installation id here in PR webhook event");
				return;
			}
		}
		const repo = await prisma.repo.findUnique({
			where: {
				repoId: String(payload.repository.id),
			},
		});
		if (!repo) {
			logger.info("Repo not found");
			return;
		}
		if (!repo.isActive) {
			logger.info("REPO IS NOT ACTIVE");
			return;
		}
		await enqueueReview({
			owner: owner.login,
			prNumber: payload.number,
			installationId: installationId,
			repoId: String(payload.repository.id),
			repoName: payload.repository.name,
		});
	} catch (error) {
		logger.error("FAILED TO REVIEW PR");
	}
});

githubApp.webhooks.on("issues.opened", async ({ id, name, payload }) => {
	const installationId = payload.installation?.id;
	const repoId = payload.repository.id.toString();
	const title = payload.issue.title;
	const body = payload.issue.body || "";
	const owner = payload.repository.owner.login;
	const repoName = payload.repository.name;
	const issueNumber = payload.issue.number;
	if (!installationId) {
		console.warn(
			`Installation id is given for issue: ${repoName}/${issueNumber}`
		);
		return;
	}
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
		console.log("this is issue open in worker");
		await issueTriageSuggestion({
			body,
			installationId,
			issueNumber,
			owner,
			repoId,
			repoName,
			title,
		});
	} catch (error) {
		console.error("Failed in issue opened", error);
	}
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

export type PullRequestFiles =
	Endpoints["GET /repos/{owner}/{repo}/compare/{base}...{head}"]["response"]["data"]["files"];

export type Commits =
	Endpoints["GET /repos/{owner}/{repo}/compare/{base}...{head}"]["response"]["data"]["commits"];
