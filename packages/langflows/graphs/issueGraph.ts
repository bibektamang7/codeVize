import { StateGraph, Annotation } from "@langchain/langgraph";
import type { IssueAnalysis, Repo } from "../types/types";
import { checkPreviousIssue, fetchRepoContext } from "../utils/issue/retrieve";
import { embedIssue } from "../utils/issue/embed";
import { labelsSuggesion } from "../utils/issue/suggestion";

export const IssueGraphState = Annotation.Root({
	installationId: Annotation<number>,
	repoName: Annotation<string>,
	repoId: Annotation<string>,
	owner: Annotation<string>,
	repo: Annotation<Repo>,
	issueNumber: Annotation<number>,
	title: Annotation<string>,
	body: Annotation<string>,
	plan: Annotation<string>,
	issueAnalysis: Annotation<IssueAnalysis>,
});

export const issueWorkflow = new StateGraph(IssueGraphState)
	.addNode("fetchRepoContext", fetchRepoContext)
	.addNode("checkPreviousIssue", checkPreviousIssue)
	.addNode("embeddingIssue", embedIssue)
	.addNode("suggestLabels", labelsSuggesion)
	.addConditionalEdges(
		"fetchRepoContext",
		(state: typeof IssueGraphState.State) => {
			if (state.plan === "FREE") {
				return "suggestLabels";
			}
			return "checkPreviousIssue";
		}
	)
	.addEdge("fetchRepoContext", "__start__")
	.addEdge("checkPreviousIssue", "embeddingIssue")
	.addEdge("embeddingIssue", "suggestLabels")
	.addEdge("suggestLabels", "__end__");
