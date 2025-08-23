import { PullRequestGraphState } from "./graph";
import { walkThroughPrompt } from "../prompts/reviewPrompt";
import { getCodeSummarizationModel } from "../utils/codeSummarizationLLMFactory";

export const tabularPRDiffSummary = async (
	State: typeof PullRequestGraphState.State
) => {
	const filteredFiles = State.unReviewedFiles;
	console.log("this is file to review", State.unReviewedFiles);
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

		console.log("this is prompt", fullSummaryPrompt.slice(0, 20));
		console.log(
			"this is reponse from llm",
			summarizationResponse.text,
			summarizationResponse.concat
		);

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

export const rawPRDiffSummary = async ({
	State,
}: typeof PullRequestGraphState) => {};
