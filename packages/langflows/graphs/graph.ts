import { Annotation, StateGraph } from "@langchain/langgraph";
import { retrieveContextFromVectorDB, retrievePRContent } from "./retriever";
import {
	publishSummary,
	rawPRDiffSummary,
	tabularPRDiffSummary,
} from "./summary";
import { checkBugsOrImprovement, publishSuggestion } from "./suggestion";

export const PullRequestGraphState = Annotation.Root({
	installationId: Annotation<number>,
	owner: Annotation<string>,
	repo: Annotation<string>,
	prNumber: Annotation<number>,
	targetBranchFiles: Annotation<number>,
	diff: Annotation<string>,
	changedFiles: Annotation<string[]>,
	retrievedDocs: Annotation<string[]>,
	prompt: Annotation<string>,
	review: Annotation<string>,
});

export const workflow = new StateGraph(PullRequestGraphState)
	.addNode("retrievePRContent", retrievePRContent)
	.addNode("retrieveContextFromVectorDb", retrieveContextFromVectorDB)
	.addNode("rawPRFilesSummarize", rawPRDiffSummary)
	.addNode("tabularPRFilesSummarize", tabularPRDiffSummary)
	.addNode("publishSummary", publishSummary)
	.addNode("checkBugsOrImprovement", checkBugsOrImprovement)
	.addNode("publishSuggestion", publishSuggestion);
