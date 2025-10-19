import { getAuthenticatedOctokit } from "github-config";
import { runGraphForPR } from "../graphs";

export async function prCodeReview(
	prId: number,
	installationId: number,
	owner: string,
	repoId: string,
	repoName: string
) {
	const octokit = await getAuthenticatedOctokit(installationId);

	// const pr = await octokit.rest.pulls.get({
	// 	owner,
	// 	repo: repoId,
	// 	pull_number: prId,
	// });
	await runGraphForPR({
		installationId,
		owner,
		prNumber: prId,
		repoId,
		repoName: repoName,
	});
	console.log("is the graph chain ended");
}
