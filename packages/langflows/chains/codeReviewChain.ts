import { getAuthenticatedOctokit } from "github-config";
import {
	summaryPrompt,
	summarizePRDiffTable,
	codeSuggestionPrompt,
} from "../prompts/reviewPrompt";
import { getCodeSummarizationModel } from "../utils/codeSummarizationLLMFactory";
import { getCodeSuggestionModel } from "../utils/codeSuggestionLLMFactory";
import fs from "fs/promises";
import path from "path";
import {
	REVIEWED_COMMITS_BLOCK_END,
	REVIEWED_COMMITS_BLOCK_START,
	SUMMARIZE_TAG,
} from "../utils";
import { checkPathFilter } from "../utils/utils";
import { extractDiffHunks } from "../graphs/retriever";

interface GithubPullRequestProps {
	sha: string;
	filename: string;
	status:
		| "modified"
		| "added"
		| "removed"
		| "renamed"
		| "copied"
		| "changed"
		| "unchanged";
	additions: number;
	deletions: number;
	changes: number;
	blob_url: string;
	raw_url: string;
	contents_url: string;
	patch?: string | undefined;
	previous_filename?: string | undefined;
}

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

	const targetBranchDiff = await octokit.request(
		"GET /repos/{owner}/{repo}/compare/{base}...{head}",
		{
			owner,
			repo,
			base: pr.data.base.sha,
			head: pr.data.head.sha,
		}
	);

	console.log("This is targed branch file", targetBranchDiff.data.files);
	console.log(
		"This is changed files data",
		targetBranchDiff.data.files?.map((file) => file.patch)
	);

	let highestReviewedCommitId: string | undefined;

	const commentsResponse = await octokit.rest.issues.listComments({
		owner,
		repo,
		issue_number: prId,
	});
	// find hte comment with the SUMMARIZE_TAG
	const botComment = commentsResponse.data.find((comment) =>
		comment.body?.includes(SUMMARIZE_TAG)
	);
	if (botComment && botComment.body) {
		const startTagIndex = botComment.body.indexOf(REVIEWED_COMMITS_BLOCK_START);
		const endTagIndex = botComment.body.indexOf(REVIEWED_COMMITS_BLOCK_END);
		if (startTagIndex !== -1 && endTagIndex !== -1) {
			const commitIdsBlock = botComment.body.substring(
				startTagIndex + REVIEWED_COMMITS_BLOCK_START.length,
				endTagIndex
			);
			//extract and process the commit IDs.
			const reviewedCommitIds = commitIdsBlock
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0);

			const commitsResponse = await octokit.rest.pulls.listCommits({
				owner,
				repo,
				pull_number: prId,
			});

			const allCommitIds = commitsResponse.data.map((commit) => commit.sha);
			for (let i = allCommitIds.length - 1; i >= 0; i--) {
				const commitId = allCommitIds[i];
				if (commitId && reviewedCommitIds.includes(commitId)) {
					highestReviewedCommitId = allCommitIds[i];
					break;
				}
			}
		}
	}

	const baseSha = highestReviewedCommitId ?? pr.data.base.sha;

	let incrementalDiff = null;
	if (baseSha !== pr.data.base.sha) {
		incrementalDiff = await octokit.request(
			"GET /repos/{owner}/{repo}/compare/{base}...{head}",
			{
				owner,
				repo,
				base: baseSha,
				head: pr.data.head.sha,
			}
		);
	} else {
		incrementalDiff = targetBranchDiff;
	}
	const incrementalFiles = incrementalDiff.data.files || [];
	const targetBranchFiles = targetBranchDiff.data.files;
	if (!targetBranchFiles) {
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

	for (const file of files) {
		if (checkPathFilter(file.filename)) {
			filterSelectedFiles.push(file);
		} else {
			filterIgnoredFiles.push(file);
		}
	}

	if (filterSelectedFiles.length === 0) {
		console.log("Skipped: filteredSelectedFiles is null");
		return;
	}
	const commits = incrementalDiff.data.commits;
	if (commits.length === 0) {
		console.log("Skipped: commits is null");
		return;
	}

	//Now, find hunks to review
	const filteredFiles = filterSelectedFiles.map(file => {
		// extractDiffHunks(file.patch, file.)
	})

	// 	const fileSummaries = [];
	// 	for (const file of files) {
	// 		const populatedSummarizePrompt = summaryPrompt
	// 			.replace("$title", pr.data.title)
	// 			.replace("$description", pr.data.body || "")
	// 			.replace("$file_diff", file.patch || "");

	// 		try {
	// 			const summaryModel = getCodeSummarizationModel();
	// 			const summaryResponse = await summaryModel.invoke([
	// 				{
	// 					role: "system",
	// 					content:
	// 						"You are a highly experienced and meticulous Senior Staff Software Engineer and code reviewer. Your primary function is to perform an expert-level analysis of pull request diffs. Your output must be concise, exceptionally accurate, and directly actionable for the developer. You are ruthless in identifying potential bugs, security vulnerabilities, performance bottlenecks, and deviations from best practices. Your insights should reflect a deep understanding of software design principles and system-wide implications. Do not provide conversational filler; get straight to the point. Your tone is professional, direct, and authoritative.",
	// 				},
	// 				{
	// 					role: "user",
	// 					content: populatedSummarizePrompt,
	// 				},
	// 			]);
	// 			console.log("this is per file summary", summaryResponse);

	// 			const text = summaryResponse.content;
	// 			const triage = extractTriage(text.toString());

	// 			fileSummaries.push({
	// 				filename: file.filename,
	// 				summary: text,
	// 				triage,
	// 			});
	// 		} catch (error) {
	// 			console.error(`Failed to summarize file ${file.filename}:`, error);
	// 			fileSummaries.push({
	// 				filename: file.filename,
	// 				summary: "failed to generate summary due to an error.",
	// 				triage: "NEEDS_REVIEW",
	// 			});
	// 		}
	// 	}

	// 	// Construct the final prompt for the tabular summary

	// 	//TODO: Code suggesion function
	// 	// not sure which approach to follow
	// 	// for now, get code suggestion per file
	// 	// prDiffCodeSuggestionOrImprovement()
	// 	const rawSummaryForTable = fileSummaries
	// 		.map(
	// 			(fs) =>
	// 				`**File:** \`${fs.filename}\`\n**Summary:** ${fs.summary}\n**Triage:** ${fs.triage}`
	// 		)
	// 		.join("\n\n");

	// 	const finalTablePrompt = summarizePRDiffTable.replace(
	// 		"$raw_summary",
	// 		rawSummaryForTable
	// 	);
	// 	let tabularPrSummary = "";
	// 	try {
	// 		const summaryModel = getCodeSummarizationModel();
	// 		const tableSummaryResponse = await summaryModel.invoke([
	// 			{
	// 				role: "system",
	// 				content: `You are a senior code reviewer responsible for producing a structured review summary.
	// You combine file-level summaries into a PR-level overview.`,
	// 			},
	// 			{
	// 				role: "user",
	// 				content: finalTablePrompt,
	// 			},
	// 		]);

	// 		tabularPrSummary = tableSummaryResponse.text;
	// 	} catch (error) {
	// 		console.error("Failed to generate PR-level tabular summary:", error);
	// 	}
	// 	// 7️⃣ Save markdown to file
	// 	const outputMarkdown = `# PR Review Summary\n\n## PR: ${pr.data.title}\n\n${tabularPrSummary}\n`;
	// 	const outputDir = path.join(process.cwd(), "reviews");
	// 	await fs.mkdir(outputDir, { recursive: true });

	// 	const outputPath = path.join(outputDir, `pr-${prId}-review.md`);
	// 	await fs.writeFile(outputPath, outputMarkdown, "utf-8");

	// 	console.log(`✅ Review summary saved to ${outputPath}`);
}

const prDiffCodeRawSummary = async () => {};
const prDiffCodeTabularSummary = async () => {};

const prDiffCodeSuggestionOrImprovement = async () => {
	const codeSuggestionModel = getCodeSuggestionModel();
	codeSuggestionModel.invoke([
		{
			role: "system",
			content: codeSuggestionPrompt,
		},
		{
			role: "user",
			content: ``,
		},
	]);
};

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
