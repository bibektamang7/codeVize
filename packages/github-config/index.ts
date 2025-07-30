import { Webhooks } from "@octokit/webhooks";
import { App, Octokit } from "octokit";

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY;
const GITHUB_APP_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

const app = new App({
	appId: GITHUB_APP_ID!,
	privateKey: GITHUB_APP_PRIVATE_KEY!,
});
const webhooks = new Webhooks({ secret: GITHUB_APP_WEBHOOK_SECRET! });

async function getInstallationOctokit(installationId: number) {
	const token = await app.getInstallationOctokit(installationId);
	return new Octokit({ auth: token });
}

export { app as GithubApp, webhooks, getInstallationOctokit };
