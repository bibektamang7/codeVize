import { BaseModel } from "./baseModel";
import { getLLMModel } from "./LLMFactory";

export class CodeLLama extends BaseModel {
	async codeReviewChain(input: string) {
		const model = await getLLMModel();
		if (!model) {
			return;
		}

		const modelResponse = await model.invoke([
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
		return {
			tags: modelResponse.concat,
			// reviewSummary: ;
			// issuesFound:
			// suggestions: [];
			// commitHash: ;
			// aiScore: ;
		};
	}
}
