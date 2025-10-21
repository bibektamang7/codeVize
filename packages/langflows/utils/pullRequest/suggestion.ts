import { getAuthenticatedOctokit } from "github-config";
import { extractDiffHunks, retrieveWithParents } from "./retriever";
import type { PullRequestGraphState } from "../../graphs/pullRequestGraph";
import { getCodeSuggestionModel } from "../codeSuggestionLLMFactory";
import { suggestionSystemPrompt } from "../../prompts/reviewPrompt";
import { Send } from "@langchain/langgraph";
import { tryInvoke } from "../utils";

const MAX_QUERY_LEN = 4000;
const BATCH_SIZE = 10;
const SIMILARITY_THRESHOLD = 0.75;

export const checkBugsOrImprovement = async (
	State: typeof PullRequestGraphState.State
) => {
	const comments: any[] = [];
	const filterSelectedFiles = State.unReviewedFiles;
	if (!filterSelectedFiles?.length) {
		console.error("Filter selected files is empty");
		return {};
	}

	const failedHunks = [];

	for (const file of filterSelectedFiles) {
		if (!file.patch) continue;

		const hunks = extractDiffHunks(file.patch, file.filename);

		for (const hunk of hunks) {
			const query = [...hunk.added, ...hunk.removed]
				.join("\n")
				.trim()
				.slice(0, MAX_QUERY_LEN);
			if (!query) continue;

			let relatedDocs: any[] = [];
			try {
				relatedDocs = await retrieveWithParents({
					query,
					kPerQuery: 6,
					maxParents: 5,
					repo: State.repoName,
					owner: State.owner,
					installationId: State.installationId,
					similarityThreshold: SIMILARITY_THRESHOLD,
				});
			} catch (err) {
				console.warn(
					"Failed to retrieve embeddings context, continuing without context:",
					err
				);
			}

			const contextBlock =
				relatedDocs.length > 0
					? `Context from similar parts of the repo (use if relevant):\n${relatedDocs
							.map(
								(d, i) => `#${i + 1} (${d.metadata.source})\n${d.pageContent}`
							)
							.join("\n\n---\n\n")}`
					: "No relevant context retrieved.";

			const prompt = `

File: ${hunk.filePath}

Changed code:
${hunk.code}

${contextBlock}

Format your comment exactly as follows:
[Emoji] [Category]
[Brief explanation of the issue.]

\`\`\`diff
[Suggested code changes here]
\`\`\`
`;

			try {
				const suggestionModel = getCodeSuggestionModel();

				const suggestionResponse = await tryInvoke(() =>
					suggestionModel.invoke([
						{ role: "system", content: suggestionSystemPrompt },
						{ role: "user", content: prompt },
					])
				);

				const suggestionText = suggestionResponse?.text?.trim();
				if (!suggestionText || suggestionText.includes("Looks good")) continue;

				const headerMatch = hunk.header.match(/@@ -\d+,\d+ \+(\d+),\d+ @@/);
				const startLine = headerMatch ? parseInt(headerMatch[1]!, 10) : 1;

				comments.push({
					path: hunk.filePath,
					body: suggestionText,
					line: startLine,
				});
			} catch (error: any) {
				failedHunks.push(hunk);
				console.error("Failed to get suggestion:", error);

				return new Send("errorOccured", {
					error: {
						message: error.message || "Failed to get suggestion",
						type: "review",
					},
				});
			}
		}
	}

	if (comments.length > 0) {
		console.log(`Posting ${comments.length} review comments to GitHub...`);
		const octokit = await getAuthenticatedOctokit(State.installationId);

		for (let i = 0; i < comments.length; i += BATCH_SIZE) {
			const batch = comments.slice(i, i + BATCH_SIZE);
			try {
				await octokit.rest.pulls.createReview({
					owner: State.owner,
					repo: State.repoName,
					pull_number: State.prNumber,
					commit_id: State.commits.at(-1)?.sha,
					event: "COMMENT",
					comments: batch,
				});
			} catch (error: any) {
				console.error("Failed to submit a batch of comments:", error);

				return new Send("errorOccured", {
					error: {
						message: error.message || "GitHub review submission failed",
						type: "review",
					},
				});
			}
		}
	}

	if (failedHunks.length > 0) {
		console.warn(`${failedHunks.length} hunks failed to review.`);
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
