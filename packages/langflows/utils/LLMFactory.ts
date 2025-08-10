import { CodeLLama } from "./CodeLLama";

export const getModelClass = () => {
	const provider = process.env.LLM_PROVIDER || "codellama:7b";
	const baseUrl = process.env.LLM_BASE_URL || "http://localhost:11434";
	const providerName = provider.split(":")[0];

	switch (providerName) {
		case "codellama":
			return new CodeLLama(provider, baseUrl);
		default:
			return new CodeLLama(provider, baseUrl);
	}
};
