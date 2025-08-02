import { Router } from "express";

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
githubApp.webhooks.on("issues.opened", ({ id, name, payload }) => {
	console.log("new issue", payload.issue.title);
});
githubApp.webhooks.onError((error) => {
	if (error.name === "AggregateError") {
		console.error("Error processing request: ", error.event);
	} else {
		console.error(error);
	}
});

const middleware = createNodeMiddleware(githubApp.webhooks, {
	path: "/webhook",
});
const router = Router();

router.use(() => {
	console.log("event occured");
});

router.use(middleware);

export default router;
