import { getAuthenticatedOctokit } from "github-config";
import { runGraphForPR } from "../graphs";

export async function prCodeReviewChain(
	prId: number,
	installationId: number,
	owner: string,
	repo: string
) {
	const octokit = await getAuthenticatedOctokit(installationId);

	const pr = await octokit.rest.pulls.get({
		owner,
		repo,
		pull_number: prId,
	});
	await runGraphForPR({ installationId, owner, prNumber: prId, repo });
}
