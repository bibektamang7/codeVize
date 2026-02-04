import { ChatGroq } from "@langchain/groq";
// import { GeminiModel } from "./Gemini";

export const getCodeSummarizationModel = () => {
	return new ChatGroq({
		model: "llama-3.3-70b-versatile",
		apiKey: process.env.GROQ_NEW_API_KEY,
		temperature: 0,
		maxRetries: 2,
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
