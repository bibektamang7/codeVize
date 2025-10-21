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
	issueNumber: Annotation<number>,
	title: Annotation<string>,
	body: Annotation<string>,
	repo: Annotation<Repo>,
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
			if (
				state.repo.repoConfig &&
				!state.repo.repoConfig.issueConfig.aiIssueTriageEnabled
			) {
				return "__end__";
			}
			if (state.plan === "FREE") {
				return "suggestLabels";
			}
			return "checkPreviousIssue";
		}
	)
	.addConditionalEdges(
		"checkPreviousIssue",
		(state: typeof IssueGraphState.State) => {
			if (
				state.repo.repoConfig &&
				!state.repo.repoConfig.issueConfig.issueEmbedEnabled
			) {
				return state.repo.repoConfig.issueConfig.issueEmbedEnabled
					? "suggestLabels"
					: "__end__";
			}
			return "embeddingIssue";
		}
	)
	.addConditionalEdges(
		"embeddingIssue",
		(state: typeof IssueGraphState.State) => {
			if (
				state.repo.repoConfig &&
				!state.repo.repoConfig.issueConfig.aiIssueTriageEnabled
			) {
				return "__end__";
			}
			return "suggestLables";
		}
	)
	.addEdge("fetchRepoContext", "__start__")
	.addEdge("checkPreviousIssue", "embeddingIssue")
	.addEdge("embeddingIssue", "suggestLabels")
	.addEdge("suggestLabels", "__end__");
