import { getAuthenticatedOctokit } from "github-config";
import { extractDiffHunks } from "./retriever";
import type { PullRequestGraphState } from "../../graphs/pullRequestGraph";
import { getCodeSuggestionModel } from "../codeSuggestionLLMFactory";
import { suggestionSystemPrompt } from "../../prompts/reviewPrompt";
import { Send } from "@langchain/langgraph";
import { tryInvoke } from "../utils";
import { prisma } from "db/prisma";

const MAX_QUERY_LEN = 4000;
const BATCH_SIZE = 10;

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
			const configContext = `
Repo Config Files:

.eslintrc.json:
${State.repoConfigFiles[".eslintrc.json"] || "Not present"}

.prettierrc:
${State.repoConfigFiles[".prettierrc"] || "Not present"}

tsconfig.json:
${State.repoConfigFiles["tsconfig.json"] || "Not present"}

package.json:
${State.repoConfigFiles["package.json"] || "Not present"}
`;

			const prompt = `
-- This is config context of the repo. Please follow the repo config explicitly --
${configContext}
File: ${hunk.filePath}

Changed code:
${hunk.code}

Format your comment exactly as follows:
[Emoji] [Category]
[Brief explanation of the issue.]

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
						role: "human",
						content: prompt,
					},
				]);

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
			}
		}
	}

	if (comments.length > 0) {
		console.log(`Posting ${comments.length} review comments to GitHub...`);
		const octokit = await getAuthenticatedOctokit(State.installationId);
		let successCount = 0;
		let isCommentFailed = false;
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
				successCount++;
			} catch (error: any) {
				isCommentFailed = true;
				console.error("Failed to submit a batch of comments:", error);
			}
		}
		if (successCount > 0) {
			await prisma.user
				.update({
					where: {
						id: State.repo.user.id,
					},
					data: {
						reviewCount: {
							increment: successCount,
						},
					},
				})
				.catch(() => {
					console.log(
						"Failed to update review count: user's ID -> ",
						State.repo.user.id
					);
				});
		}
		if (isCommentFailed) {
			return new Send("errorOccured", {
				...State,
				error: {
					message: "GitHub review submission failed",
					type: "review",
				},
			});
		}
	}

	if (failedHunks.length > 0) {
		console.warn(`${failedHunks.length} hunks failed to review.`);

		return new Send("errorOccured", {
			...State,
			error: {
				message: "Failed to get suggestion",
				type: "review",
			},
		});
	}

	return { ...State };
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
