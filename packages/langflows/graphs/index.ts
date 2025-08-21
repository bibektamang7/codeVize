import { END, START } from "@langchain/langgraph";
import { workflow } from "./graph";

interface GraphInitialStateProps {
	owner: string;
	repo: string;
	prNumber: number;
	installationId: number;
}

export const runGraphForPR = async (
	graphInitialState: GraphInitialStateProps
) => {
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
	const app = workflow.compile();

	app.invoke(graphInitialState);
};
