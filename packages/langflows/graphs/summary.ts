import { PullRequestGraphState } from "./graph";
import { walkThroughPrompt } from "../prompts/reviewPrompt";
import { getCodeSummarizationModel } from "../utils/codeSummarizationLLMFactory";
import { getAuthenticatedOctokit } from "github-config";

//TODO:RETRY MECHANISM NOT IMPLEMENTED FOR NOW
export const tabularPRDiffSummary = async (
	State: typeof PullRequestGraphState.State
) => {
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

		const octokit = await getAuthenticatedOctokit(State.installationId);
		const summarySubmit = await octokit.request(
			"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
			{
				owner: State.owner,
				repo: State.repo,
				issue_number: State.prNumber,
				body: summarizationResponse.text,
			}
		);
		console.log(
			"Successfully posted summary to the pull request.",
			summarySubmit.data.author_association
		);
	} catch (error) {
		console.log("this is error in summary", error);
		console.error("Failed to summarize the PR diffs");
	}
};

export const publishSummary = async ({
	State,
}: typeof PullRequestGraphState) => {};

export const rawPRDiffSummary = async ({
	State,
}: typeof PullRequestGraphState) => {};
