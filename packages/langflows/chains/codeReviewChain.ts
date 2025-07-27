import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
	baseUrl: "http://localhost:11434",
	model: "codellama:7b",
});

interface State {
	systemMessage: string;
	title: string;
	description: string;
	rawSummary: string;
	shortSummary: string;
	filename: string;
	fileContent: string;
	fileDiff: string;
	patches: string;
	diff: string;
	commentChain: string;
	comment: string;
}

const state: State = {
	systemMessage: "",
	title: "no title provided",
	description: "no description provided",
	rawSummary: "",
	shortSummary: "",
	filename: "",
	fileContent: "file contents cannot be provided",
	fileDiff: "file diff cannot be provided",
	patches: "",
	diff: "no diff",
	commentChain: "no other comments on this patch",
	comment: "no comment provided",
};
