import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export class GeminiModel {
	private geminiModel: ChatGoogleGenerativeAI;

	constructor(model: string = "gemini-2.5-pro", baseUrl: string) {
		const geminiApiKey = process.env.GEMINI_API_KEY;

		const geminiModel = new ChatGoogleGenerativeAI({
			model,
			temperature: 0,
			maxRetries: 2,
			baseUrl,
			apiKey: geminiApiKey,
		});
		this.geminiModel = geminiModel;
	}
	getModel() {
		return this.geminiModel;
	}
}
