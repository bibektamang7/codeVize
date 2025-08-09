import { ChatOllama } from "@langchain/ollama";
export const getLLMModel = async () => {
	const provider = process.env.LLM_PROVIDER || "codellama:7b";
	const baseUrl = process.env.LLM_BASE_URL || "http://localhost:11434";

	switch (provider) {
		case "codellama:7b":
			return new ChatOllama({
				baseUrl,
				model: provider,
			});
		default:
			return;
	}
};
