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
	console.log("THis is in run graph for pr");
	workflow.addEdge(START, "retrievePRContent");
	workflow.addEdge("retrievePRContent", "tabularPRFilesSummarize");
	workflow.addEdge("tabularPRFilesSummarize", "checkBugsOrImprovement");
	workflow.addConditionalEdges(
		"checkBugsOrImprovement",
		function shouldPublish(): string {
			return END;
		}
	);
	workflow.addEdge("checkBugsOrImprovement", END);
	const app = workflow.compile();

	app.invoke(graphInitialState);
};
