import { getAuthenticatedOctokit } from "github-config";

export const listRepoFiles = async (
	installationId: number,
	owner: string,
	repo: string,
	path = ""
): Promise<string[]> => {
	const octokit = await getAuthenticatedOctokit(installationId);
	const { data } = await octokit.request(
		"GET /repos/{owner}/{repo}/contents/{path}",
		{
			owner,
			repo,
			path,
		}
	);

	if (!Array.isArray(data)) {
		console.warn(`Path ${path} is not a directory, skipping.`);
		return [];
	}

	let files: string[] = [];
	for (const item of data) {
		if (item.type === "dir") {
			const subFiles = await listRepoFiles(
				installationId,
				owner,
				repo,
				item.path
			);
			files = files.concat(subFiles);
		} else if (item.type === "file" && /\.(ts|tsx|js|jsx)$/.test(item.name)) {
			files.push(item.path);
		}
	}
	return files;
};

export const getRepoFileContent = async (
	installationId: number,
	owner: string,
	repo: string,
	filePath: string
): Promise<string | null> => {
	try {
		const octokit = await getAuthenticatedOctokit(installationId);
		const { data } = await octokit.request(
			"GET /repos/{owner}/{repo}/contents/{path}",
			{
				owner,
				repo,
				path: filePath,
			}
		);
		if (Array.isArray(data)) {
			return null;
		}
		if (data.type === "file" && typeof data.content === "string") {
			return Buffer.from(data.content, "base64").toString("utf-8");
		}
		return null;
	} catch {
		return null;
	}
};

export const getPRDiff = async (
	installationId: number,
	owner: string,
	repo: string,
	prNumber: number
): Promise<string> => {
	const octokit = await getAuthenticatedOctokit(installationId);
	const { data } = await octokit.request(
		"GET /repos/{owner}/{repo}/pulls/{pull_number}",
		{
			owner,
			repo,
			pull_number: prNumber,
		}
	);
	const diffRes = await fetch(data.diff_url);
	return await diffRes.text();
};

export const postComment = async (
	installationId: number,
	owner: string,
	repo: string,
	prNumber: number,
	body: string
) => {
	const octokit = await getAuthenticatedOctokit(installationId);
	await octokit.request(
		"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
		{
			owner,
			repo,
			issue_number: prNumber,
			body,
		}
	);
};
