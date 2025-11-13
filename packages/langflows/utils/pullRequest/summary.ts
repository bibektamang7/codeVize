import { Send } from "@langchain/langgraph";
import type { PullRequestGraphState } from "../../graphs/pullRequestGraph";
import { walkThroughPrompt } from "../../prompts/reviewPrompt";
import { getCodeSummarizationModel } from "../codeSummarizationLLMFactory";
import { getAuthenticatedOctokit } from "github-config";

export const tabularPRDiffSummary = async (
	State: typeof PullRequestGraphState.State
) => {
	const filteredFiles = State.unReviewedFiles;

	if (!filteredFiles || filteredFiles.length === 0) {
		console.warn("Skipped: No files to review");
		return;
	}
	let combinedDiff = "";
	for (const file of filteredFiles) {
		if (file.patch) {
			combinedDiff += `\n\n--- ${file.filename} ---\n\n`;
			combinedDiff += file.patch;
		}
	}

	let dynamicPrompt = walkThroughPrompt;

	if (State.repo.repoConfig?.reviewConfig) {
		const { isProgressFortuneEnabled, poemEnabled } =
			State.repo.repoConfig.reviewConfig;

		if (isProgressFortuneEnabled) {
			dynamicPrompt += `
### Progress Fortune
- Include a brief, insightful fortune or prediction about the success of these changes in production.
- Be optimistic but realistic about the potential impact of these changes.
			`;
		}

		if (poemEnabled) {
			dynamicPrompt += `
### Poem
- At the end of your response, include a short, relevant poem related to the code changes or their purpose.
- The poem should be 2-4 lines, capturing the essence of the technical changes in a creative way.
			`;
		}
	}

	let diffTemplate = `
## Diff
\`\`\`diff
$file_diff
\`\`\`
	`;
	const fullSummaryPrompt = diffTemplate.replace("$file_diff", combinedDiff);
	const summarizationModel = getCodeSummarizationModel();

	try {
		const summarizationResponse = await summarizationModel.invoke([
			{
				role: "system",
				content: dynamicPrompt,
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
				repo: State.repoName,
				issue_number: State.prNumber,
				body: summarizationResponse.text,
			}
		);
		console.log(
			"Successfully posted summary to the pull request.",
			summarySubmit.data.author_association
		);
	} catch (error: any) {
		console.log("this is error in summary", error);
		console.error("Failed to summarize the PR diffs");
		return new Send("errorOccured", {
			...State,
			error: {
				type: "PR Summary",
				message: error.message || `Failed to summarize PR\n: ${error}`,
			},
		});
	}
};
