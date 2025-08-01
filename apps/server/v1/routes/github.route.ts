import { Router } from "express";

import {
	createNodeMiddleware,
	webhooks,
	getAuthenticatedOctokit,
	getAuthenticatedInstallationId,
} from "github-config";

webhooks.on("pull_request", async ({ payload }) => {
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
webhooks.on("issues.opened", ({ id, name, payload }) => {
	console.log("new issue", payload.issue.title);
});
const router = Router();

router.use("/webhook", async (req, res, next) => {
	try {
		console.log(req.body)
		await webhooks.verifyAndReceive({
			id: req.headers["x-github-delivery"] as string,
			name: req.headers["x-github-event"] as string,
			signature: req.headers["x-hub-signature-256"] as string,
			payload: req.body,
		});
		res.status(200).send("Webhook received");
		next()
	} catch (error) {
		console.error("webhook error", error);
		res.status(400).send("Invalid webhook");
	}
});

export default router;
