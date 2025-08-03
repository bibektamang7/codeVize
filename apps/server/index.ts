import express from "express";
import { prisma } from "db/prisma";
import cors from "cors";

const app = express();

const ALLOWED_HEADERS = process.env.ALLOWED_HEADERS;

app.use(
	cors({
		allowedHeaders: ALLOWED_HEADERS,
		credentials: true,
		methods: ["POST", "GET", "PATCH", "PUT", "DELETE"],
	})
);

import {
	githubApp,
	createNodeMiddleware,
	getAuthenticatedOctokit,
	getAuthenticatedInstallationId,
} from "github-config";

githubApp.webhooks.on("pull_request", async ({ payload }) => {
	console.log("pr webhook callled so do check it out");
	console.log("PR received", payload.pull_request.title);
	const { owner } = payload.repository;
	const prNumber = payload.pull_request.number;

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
	const octokit = await getAuthenticatedOctokit(installationId);
	const diff = await octokit.request(
		"GET /repos/{owner}/{repo}/pulls/{pull_number}",
		{
			owner: owner.login,
			repo: payload.repository.name,
			pull_number: prNumber,
			headers: {
				accept: "application/vnd.github.v3.diff",
			},
		}
	);
	console.log("PR diff", diff);
});

githubApp.webhooks.on("installation.deleted", ({ octokit, payload }) => {
	console.log("installed github app is deleted");
});

githubApp.webhooks.on(
	"installation.created",
	async ({ id, octokit, name, payload }) => {
		const installationId = payload.installation.id.toString();
		const githubAccountId = payload.installation.account?.id.toString();
		if (!githubAccountId) return;
		const user = await prisma.user.findUnique({
			where: { githubId: githubAccountId },
		});

		if (!user) {
			console.log("User not found");
			return;
		}
		const repos = await octokit.rest.apps.listReposAccessibleToInstallation();
		const isSingleRepo = repos.data.repositories.length === 1;

		const repoData = repos.data.repositories.map((repo) => ({
			installationId: installationId,
			repoName: repo.name,
			repoFullName: repo.full_name,
			repoURL: repo.html_url,
			repoId: repo.id.toString(),
			isActive: isSingleRepo,
			userId: user.id,
			languages: [repo.language || ""],
		}));

		await prisma.repo.createMany({
			data: repoData,
			skipDuplicates: true,
		});
		console.log("repos stored for user ", user.username);
	}
);

githubApp.webhooks.on("issues.opened", ({ id, name, payload }) => {
	console.log("new issue", payload.issue.title);
	console.log("this is data", payload.issue);

	try {
	} catch (error) {}
});
githubApp.webhooks.onError((error) => {
	if (error.name === "AggregateError") {
		console.error("Error processing request: ", error.event);
	} else {
		console.error(error);
	}
});

const middleware = createNodeMiddleware(githubApp.webhooks, {
	path: "/api/v1/githubs/webhook",
});

app.use(middleware);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`Application is listening at ${PORT}`);
});
