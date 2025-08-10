import { ChatOllama } from "@langchain/ollama";
import { BaseModel } from "./baseModel";

export class CodeLLama extends BaseModel {
	model: ChatOllama;
	constructor(provider: string, baseUrl: string) {
		super();
		this.model = new ChatOllama({
			baseUrl: baseUrl || "http://localhost:11434",
			model: provider || "codellama:7b",
		});
	}
	async codeReviewChain(input: string) {
		const modelResponse = await this.model.invoke([
			{
				content:
					"You are a code review assistant. Please review the following code and provide feedback.",
				role: "system",
			},
			{
				content: input,
				role: "user",
			},
			{
				content:
					"Please provide a detailed review of the code, including any potential issues, improvements, and best practices.",
				role: "assistant",
			},
			{
				content: "Please provide your review in a structured format.",
				role: "user",
			},
		]);
		// return {
		// 	tags: modelResponse.concat,
		// 	// reviewSummary: ;
		// 	// issuesFound:
		// 	// suggestions: [];
		// 	// commitHash: ;
		// 	// aiScore: ;
		// };
	}
	async embedRepoChain(): Promise<void> {}
}
