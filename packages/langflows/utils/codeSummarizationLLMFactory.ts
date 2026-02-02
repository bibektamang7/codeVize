import { ChatOpenAI } from "@langchain/openai";
// import { GeminiModel } from "./Gemini";

export const getCodeSummarizationModel = () => {
	console.log("api key: ", process.env.MINIMAX_API_KEY);
	return new ChatOpenAI({
		model: "MiniMax-M2.1",
		temperature: 0.8,
		streaming: true,
		apiKey: process.env.MINIMAX_API_KEY,
		configuration: {
			baseURL: "https://api.minimax.io/v1",
		},
	});
	// const provider = process.env.SUMMARIZATION_LLM_PROVIDER || "gemini-2.0-flash";
	// const baseUrl =
	// 	process.env.SUMMARIZATION_LLM_BASE_URL || "http://localhost:11434";
	// const providerName = provider.split("-")[0];

	// switch (providerName) {
	// 	case "gemini":
	// 		return new GeminiModel(provider, baseUrl).getModel();
	// 	default:
	// 		return new GeminiModel(provider, baseUrl).getModel();
	// }
};
