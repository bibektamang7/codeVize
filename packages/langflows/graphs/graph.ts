import { Annotation, StateGraph } from "@langchain/langgraph";
import { retrieveContextFromVectorDB, retrievePRContent } from "./retriever";
import {
	publishSummary,
	rawPRDiffSummary,
	tabularPRDiffSummary,
} from "./summary";
import { checkBugsOrImprovement, publishSuggestion } from "./suggestion";
import type { Commits, PullRequestFiles } from "github-config";

export const PullRequestGraphState = Annotation.Root({
	installationId: Annotation<number>,
	owner: Annotation<string>,
	repo: Annotation<string>,
	prNumber: Annotation<number>,
	unReviewedFiles: Annotation<PullRequestFiles>,
	diff: Annotation<string>,
	retrievedDocs: Annotation<string[]>,
	prompt: Annotation<string>,
	review: Annotation<string>,
	vectorContext: Annotation<string>,
	commits: Annotation<Commits>,
});

//TODO:
/**
 * if PR is changed then review only unreviewd changes, for that, use to retireve all commited block/comments and extract commit id
 *
 *
 */

export const workflow = new StateGraph(PullRequestGraphState)
	.addNode("retrievePRContent", retrievePRContent)
	.addNode("tabularPRFilesSummarize", tabularPRDiffSummary)
	.addNode("publishSummary", publishSummary)
	.addNode("checkBugsOrImprovement", checkBugsOrImprovement)
	.addNode("publishSuggestion", publishSuggestion);
