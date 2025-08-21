import { getCodeSuggestionModel } from "../utils/codeSuggestionLLMFactory";
import type { PullRequestGraphState } from "./graph";
import { codeSuggestionPrompt } from "../prompts/reviewPrompt";
import { getAuthenticatedOctokit } from "github-config";
import { extractDiffHunks, retrieveWithParents } from "./retriever";
import { Document } from "langchain/document";

//TODO: rename function name
export const checkBugsOrImprovement = async ({
	State,
}: typeof PullRequestGraphState) => {
	const reviews: { file: string; suggestions: string }[] = [];
	const filterSelectedFiles = State.unReviewedFiles;
	if (!filterSelectedFiles || filterSelectedFiles.length === 0) {
		console.error("Filter selected files is empty");
		return;
	}

	let failedHunks = [];
	for (const file of filterSelectedFiles) {
		if (!file.patch) continue;

		const hunks = extractDiffHunks(file.patch, file.filename);

		for (const hunk of hunks) {
			const query = hunk.added.join("\n") || hunk.removed.join("\n");

			const relatedDocs: Document[] = await retrieveWithParents({
				query,
				kPerQuery: 5,
				maxParents: 3,
			});
			console.log(relatedDocs[0]?.metadata, "this is metadata");
			console.log(relatedDocs[0]?.pageContent, "this is pageContent");

			const prompt = `
				File: ${hunk.filePath}	
				changed code:
				${hunk.code}

				Relevant repo context: 
				${relatedDocs.map((d) => `Source: ${d.metadata.source}\n${d.pageContent}`).join("\n\n")}

			`;
			try {
				const suggestionModel = getCodeSuggestionModel();
				const suggestionResponse = await suggestionModel.invoke([
					{
						role: "system",
						content: codeSuggestionPrompt,
					},
					{
						role: "user",
						content: prompt,
					},
				]);
				console.log("This is suggestion for the hunk", hunk.filePath);
				console.log(suggestionResponse.content);
			} catch (error) {
				failedHunks.push(hunk);
				console.error("failed to get suggestion");
			}
		}
		try {
			const octokit = await getAuthenticatedOctokit(State.installationId);
			// const submitReview = await octokit.request("")
			await octokit.rest.pulls.createReview({
				owner: State.owner,
				repo: State.repo,
				pull_number: State.prNumber,
				commit_id: State.commits[State.commits.length - 1]?.sha,
				event: "COMMENT",
				body: "",
			});
		} catch (error) {
			console.error("Failed while dealing with submitting review");
		}
	}
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
