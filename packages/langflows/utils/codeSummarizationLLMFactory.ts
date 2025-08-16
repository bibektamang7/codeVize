import { GeminiModel } from "./Gemini";

export const getCodeSummarizationModel = () => {
	const provider =
		process.env.SUMMARIZATION_LLM_PROVIDER || "deepseek-coder-v2";
	const baseUrl =
		process.env.SUMMARIZATION_LLM_BASE_URL || "http://localhost:11434";
	const providerName = provider.split(":")[0];

	switch (providerName) {
		case "gemini":
			return new GeminiModel(provider, baseUrl).getModel();
		default:
			return new GeminiModel(provider, baseUrl).getModel();
	}
};
