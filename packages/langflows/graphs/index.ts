import { END, START } from "@langchain/langgraph";
import { workflow } from "./graph";

export const runGraphForPR = async () => {
	workflow.addEdge(START, "retrievePRContent");
	workflow.addEdge("retrievePRContent", "retrieveContextFromVectorDb");
	workflow.addEdge("retrieveContextFromVectorDb", "rawPRFilesSummarize");
	workflow.addEdge("rawPRFilesSummarize", "tabularPRFilesSummarize");
	workflow.addEdge("tabularPRFilesSummarize", "publishSummary");
	workflow.addEdge("publishSummary", "checkBugsOrImprovement");
	workflow.addConditionalEdges(
		"checkBugsOrImprovement",
		function shouldPublish(): string {
			return END;
		}
	);
	workflow.addEdge("checkBugsOrImprovement", "publishSuggestion");
	workflow.addEdge("publishSuggestion", END);
	// const app = workflow.compile()
};
