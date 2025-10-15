import { getCodeSuggestionModel } from "../codeSuggestionLLMFactory";
import type { PullRequestGraphState } from "../../graphs/graph";
import {
	// codeSuggestionPrompt,
	newSuggestonPrompt,
	reviewPrompt,
	suggestionSystemPrompt,
} from "../../prompts/reviewPrompt";
import { getAuthenticatedOctokit } from "github-config";
import { extractDiffHunks, retrieveWithParents } from "./retriever";
import { Document } from "langchain/document";

//TODO: rename function name
interface ReviewComment {
	path: string;
	body: string;
	line: number;
	start_line?: number;
}

export const checkBugsOrImprovement = async (
	State: typeof PullRequestGraphState.State
) => {
	const comments: ReviewComment[] = [];
	const filterSelectedFiles = State.unReviewedFiles;
	if (!filterSelectedFiles || filterSelectedFiles.length === 0) {
		console.error("Filter selected files is empty");
		return;
	}

	let failedHunks = [];
	for (const file of filterSelectedFiles) {
		if (!file.patch) continue;

		const hunks = extractDiffHunks(file.patch, file.filename);
		console.log("this hunks", hunks);

		for (const hunk of hunks) {
			const query = hunk.added.join("\n") || hunk.removed.join("\n");

			// Assuming `retrieveWithParents` returns a proper context
			const relatedDocs = await retrieveWithParents({
				query,
				kPerQuery: 5,
				maxParents: 3,
				repo: State.repo,
				owner: State.owner,
				installationId: State.installationId,
			});

			const prompt = `
File: ${hunk.filePath}
changed code:
${hunk.code}

Relevant repo context:
${relatedDocs.map((d) => `Source: ${d.metadata.source}\n${d.pageContent}`).join("\n\n")}

Review the code above and provide a concise, actionable inline comment. Your response MUST follow this format, including the emoji, category, explanation, and diff block with suggested changes:

[Emoji] [Category]
[Your brief explanation of the issue.]

\`\`\`diff
[Suggested code changes here]
\`\`\`
`;
			try {
				const suggestionModel = getCodeSuggestionModel();
				const suggestionResponse = await suggestionModel.invoke([
					{
						role: "system",
						content: suggestionSystemPrompt,
					},
					{
						role: "user",
						content: prompt,
					},
				]);
				console.log("this is suggestion response", suggestionResponse.text);

				// --- ADDED LOGIC ---
				// Parse the hunk header to get the starting line number for the comment
				// The hunk header is like "@@ -1,4 +1,4 @@"
				const headerMatch = hunk.header.match(/@@ -\d+,\d+ \+(\d+),\d+ @@/);
				if (headerMatch && suggestionResponse.text) {
					const startLine = parseInt(headerMatch[1]!, 10);
					comments.push({
						path: hunk.filePath,
						body: suggestionResponse.text,
						line: startLine,
					});
				}
			} catch (error) {
				failedHunks.push(hunk);
				console.error("failed to get suggestion", error);
			}
		}
	}

	// --- ADDED LOGIC ---
	// Post all collected comments in a single review
	console.log("this is comments", comments);
	if (comments.length > 0) {
		console.log(
			"THis is commits",
			State.commits.length,
			State.commits[State.commits.length - 1]?.sha
		);
		try {
			const octokit = await getAuthenticatedOctokit(State.installationId);
			await octokit.rest.pulls.createReview({
				owner: State.owner,
				repo: State.repo,
				pull_number: State.prNumber,
				commit_id: State.commits[State.commits.length - 1]?.sha,
				event: "COMMENT", // Post as a comment review
				comments: comments, // Provide the array of collected comments
			});
			console.log("Successfully posted all review comments.");
		} catch (error) {
			console.error("Failed to submit review comments to GitHub", error);
		}
	}
	return {};
};

export const publishSuggestion = async ({
	State,
}: typeof PullRequestGraphState) => {
	const octokit = await getAuthenticatedOctokit(State.installationId);
	const publishedResponse = await octokit.request(
		"POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/",
		{
			owner: State.owner,
			repo: State.repo,
			pull_number: State.prNumber,
		}
	);
};
