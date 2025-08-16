import { getAuthenticatedOctokit } from "github-config";
import {
	summarizeFileDiff,
	summarizePRDiffTable,
} from "../prompts/reviewPrompt";
import { getCodeSuggestionModel } from "../utils/CodeSuggestionLLMFactory";
import { getCodeSummarizationModel } from "../utils/CodeSummarizationLLMFactory";

export async function prCodeReviewChain(
	prId: number,
	installationId: number,
	owner: string,
	repo: string,
	highestReviewedCommitId?: string
) {
	const octokit = await getAuthenticatedOctokit(installationId);

	const pr = await octokit.rest.pulls.get({
		owner,
		repo,
		pull_number: prId,
	});

	const rawDiff = await octokit.request(
		"GET /repos/{owner}/{repo}/pulls/{pull_number}",
		{
			owner,
			repo,
			pull_number: prId,
			headers: {
				accept: "application/vnd.github.v3.diff",
			},
		}
	);

	const targetBranchDiff = await octokit.request(
		"GET /repos/{owner}/{repo}/compare/{base}...{head}",
		{
			owner,
			repo,
			base: pr.data.head.sha,
			head: pr.data.head.sha,
		}
	);

	let incrementalDiff = null;
	if (highestReviewedCommitId) {
		incrementalDiff = await octokit.request(
			"GET /repos/{owner}/{repo}/compare/{base}...{head}",
			{
				owner,
				repo,
				base: highestReviewedCommitId,
				head: pr.data.head.sha,
			}
		);
	}
	const incrementalFiles = incrementalDiff?.data.files;
	const targetBranchFiles = targetBranchDiff.data.files;
	if (!incrementalFiles || !targetBranchFiles) {
		console.log("Skipped: files data is missing");
		return;
	}
	const files = targetBranchFiles.filter((targetBranchFile) => {
		incrementalFiles.some((incrementalFile) => {
			incrementalFile.filename === targetBranchFile.filename;
		});
	});

	if (files.length === 0) {
		console.log("Skipped: files is null");
		return;
	}
	const filterSelectedFiles = [];
	const filterIgnoredFiles = [];

	const fileSummaries = [];
	for (const file of files) {
		const populatedSummarizePrompt = summarizeFileDiff
			.replace("$title", pr.data.title)
			.replace("$description", pr.data.body || "")
			.replace("$file_diff", file.patch || "");

		try {
			const summaryModel = getCodeSummarizationModel();
			const summaryReponse = await summaryModel.invoke([
				{
					type: "user",
					content: populatedSummarizePrompt,
				},
			]);
			const text = summaryReponse.text;
			const summary = extractSummary(text);
			const triage = extractTriage(text);

			fileSummaries.push({
				filename: file.filename,
				summary,
				triage,
			});
		} catch (error) {
			console.error(`Failed to summarize file ${file.filename}:`, error);
			fileSummaries.push({
				filename: file.filename,
				summary: "failed to generate summary due to an error.",
				triage: "NEEDS_REVIEW",
			});
		}
		const rawSummaryForTable = fileSummaries
			.map(
				(fs) =>
					`**File:** \`${fs.filename}\`\n**Summary:** ${fs.summary}\n**Triage:** ${fs.triage}`
			)
			.join("\n\n");

		// Construct the final prompt for the tabular summary
		const finalTablePrompt = summarizePRDiffTable.replace(
			"$raw_summary",
			rawSummaryForTable
		);

		try {
			const summaryModel = getCodeSuggestionModel();
			const tableSummaryResponse = await summaryModel.invoke([
				{
					type: "user",
					content: finalTablePrompt,
				},
			]);

			console.log("this is summary content", tableSummaryResponse.text);
		} catch (error) {}
	}
}

function extractSummary(aiResponse: string): string {
	const summaryMatch = aiResponse.match(/Summary: ([\s\S]*?)\[TRIAGE\]:/);
	return summaryMatch ? summaryMatch[0].trim() : "Summary not found.";
}

function extractTriage(aiResponse: string): string {
	const triageMatch = aiResponse.match(/\[TRIAGE\]: (NEEDS_REVIEW|APPROVED)/);
	return triageMatch ? triageMatch[0].trim() : "NEEDS_REVIEW";
}
// async function checking() {
// 	const res = await model.invoke([
// 		{
// 			content: "const hell = [1,2,3,47,23,4] how to sort the array",
// 			role: "user",
// 		},
// 	]);
// 	console.log(res);
// }

// checking();

// const state: State = {
// 	systemMessage: "",
// 	title: "no title provided",
// 	description: "no description provided",
// 	rawSummary: "",
// 	shortSummary: "",
// 	filename: "",
// 	fileContent: "file contents cannot be provided",
// 	fileDiff: "file diff cannot be provided",
// 	patches: "",
// 	diff: "no diff",
// 	commentChain: "no other comments on this patch",
// 	comment: "no comment provided",
// };
