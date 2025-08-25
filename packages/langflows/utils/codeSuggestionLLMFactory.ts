import type { ChatOllama } from "@langchain/ollama";
import { CodeLlamaModel } from "./Ollama";

export const getCodeSuggestionModel = (): ChatOllama => {
	const provider = process.env.LLM_PROVIDER || "codellama:latest";
	const baseUrl = process.env.LLM_BASE_URL || "http://localhost:11434";
	const providerName = provider.split(":")[0];

	switch (providerName) {
		case "codellama":
			return new CodeLlamaModel(provider, baseUrl).getModel();
		default:
			return new CodeLlamaModel(provider, baseUrl).getModel();
	}
};
