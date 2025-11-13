import { StateGraph, Annotation } from "@langchain/langgraph";
import type { IssueAnalysis, Repo } from "../types/types";
import { fetchRepoContext } from "../utils/issue/retrieve";
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
			return "suggestLabels";
		}
	)
	.addEdge("__start__", "fetchRepoContext")
	.addEdge("fetchRepoContext", "suggestLabels")
	.addEdge("suggestLabels", "__end__");
