import { getAuthenticatedOctokit } from "github-config";
export async function embedRepoChain(
	installationId: number,
	owner: string,
	repoName: string
) {
	console.log("embedRepoChian called with")
	const octokit = await getAuthenticatedOctokit(installationId);
	const { data } = await octokit.rest.repos.getContent({
		owner,
		repo: repoName,
		path: "",
	});

	console.log(data);
	console.log("Fetching repository content...");
}