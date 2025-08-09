import { Annotation } from "@langchain/langgraph";
import { StateGraph } from "@langchain/langgraph";

const GlobalState = Annotation.Root({
	systemMessage: Annotation<string>,
	repoId: Annotation<string>,
	prNumber: Annotation<string | null>,
	diffText: Annotation<string | null>,
	repoChuncks: Annotation<Array<string>>,
	prChunks: Annotation<Array<string>>,
	summary: Annotation<string>,
});

const graph = new StateGraph(GlobalState);
