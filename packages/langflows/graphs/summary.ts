import { PullRequestGraphState } from "./graph";
import { walkThroughPrompt } from "../prompts/reviewPrompt";
import { getCodeSummarizationModel } from "../utils/codeSummarizationLLMFactory";
import { SystemMessage } from "@langchain/core/messages";
import { getAuthenticatedOctokit } from "github-config";

export const rawPRDiffSummary = async ({
	State,
}: typeof PullRequestGraphState) => {};

export const tabularPRDiffSummary = async ({
	State,
}: typeof PullRequestGraphState) => {
	const filteredFiles = State.unReviewedFiles;
	if (!filteredFiles || filteredFiles.length === 0) {
		console.warn("Skipped: No files to review");
		return;
	}
	let diffTemplet = `
## Diff
\`\`\`diff
$file_diff
\`\`\`
	`;
	let combinedDiff = "";
	for (const file of filteredFiles) {
		if (file.patch) {
			combinedDiff += `\n\n--- ${file.filename} ---\n\n`;
			combinedDiff += file.patch;
		}
	}

	const fullSummaryPrompt = diffTemplet.replace("$file_diff", combinedDiff);
	const summarizationModel = getCodeSummarizationModel();

	try {
		const summarizationResponse = await summarizationModel.invoke([
			{
				role: "system",
				content: walkThroughPrompt,
			},
			{
				role: "user",
				content: fullSummaryPrompt,
			},
		]);
		console.log(summarizationResponse.content);

		//TODO: submit summary to GITHUB
		// const octokit = await getAuthenticatedOctokit(State.installationId);
		// const summarySubmit = await octokit.request(
		// 	"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
		// 	{
		// 		owner: State.owner,
		// 		repo: State.repo,
		// 		issue_number: State.prNumber,
		// 		body: JSON.stringify(summarizationResponse.content),
		// 	}
		// );
		// console.log("Successfully posted summary to the pull request.");
	} catch (error) {
		console.error("Failed to summarize the PR diffs");
	}
};

export const publishSummary = async ({
	State,
}: typeof PullRequestGraphState) => {};
