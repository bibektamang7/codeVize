import { getCodeSuggestionModel } from "../utils/codeSuggestionLLMFactory";
import type { PullRequestGraphState } from "./graph";
import {
	// codeSuggestionPrompt,
	newSuggestonPrompt,
} from "../prompts/reviewPrompt";
import { getAuthenticatedOctokit } from "github-config";
import { extractDiffHunks, retrieveWithParents } from "./retriever";
import { Document } from "langchain/document";
import { Command } from "@langchain/langgraph";

//TODO: rename function name
export const checkBugsOrImprovement = async (
	State: typeof PullRequestGraphState.State
) => {
	console.log("This is in checkBugs or improvement");
	// const reviews: { file: string; suggestions: string }[] = [];
	const filterSelectedFiles = State.unReviewedFiles;
	if (!filterSelectedFiles || filterSelectedFiles.length === 0) {
		console.error("Filter selected files is empty");
		return;
	}

	let failedHunks = [];
	console.log("is this here one where");
	for (const file of filterSelectedFiles) {
		if (!file.patch) continue;

		console.log("this is patch", file.patch.length);

		const hunks = extractDiffHunks(file.patch, file.filename);
		console.log("this hunks", hunks);

		for (const hunk of hunks) {
			const query = hunk.added.join("\n") || hunk.removed.join("\n");

			console.log("this is query", query);
			const relatedDocs: Document[] = await retrieveWithParents({
				query,
				kPerQuery: 5,
				maxParents: 3,
				repo: State.repo,
				owner: State.owner,
				installationId: State.installationId,
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
				console.log("you shoudl be ehre to");
				const suggestionResponse = await suggestionModel.invoke([
					{
						role: "system",
						content: newSuggestonPrompt,
					},
					{
						role: "user",
						content: prompt,
					},
				]);
				console.log("this is suggestion response", suggestionResponse.content);
			} catch (error) {
				failedHunks.push(hunk);
				console.error("failed to get suggestion", error);
			}
		}
		console.log("is this here");
		return {};
		// try {
		// 	const octokit = await getAuthenticatedOctokit(State.installationId);
		// 	// const submitReview = await octokit.request("")
		// 	await octokit.rest.pulls.createReview({
		// 		owner: State.owner,
		// 		repo: State.repo,
		// 		pull_number: State.prNumber,
		// 		commit_id: State.commits[State.commits.length - 1]?.sha,
		// 		event: "COMMENT",
		// 		body: "",
		// 	});
		// } catch (error) {
		// 	console.error("Failed while dealing with submitting review");
		// }
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
