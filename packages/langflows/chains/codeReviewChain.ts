import { ChatOllama } from "@langchain/ollama";

const model = new ChatOllama({
	baseUrl: "http://localhost:11434",
	model: "codellama:7b",
});

export async function codeReviewChain(input: string) {}


// async function checking() {
// 	const res = await model.invoke([
// 		{
// 			content: "const hell = [1,2,3,47,23,4] how to sort the array",
// 			role: "user",
// 		},
// 	]);
// 	console.log(res);
// }

// checking();

// const state: State = {
// 	systemMessage: "",
// 	title: "no title provided",
// 	description: "no description provided",
// 	rawSummary: "",
// 	shortSummary: "",
// 	filename: "",
// 	fileContent: "file contents cannot be provided",
// 	fileDiff: "file diff cannot be provided",
// 	patches: "",
// 	diff: "no diff",
// 	commentChain: "no other comments on this patch",
// 	comment: "no comment provided",
// };
