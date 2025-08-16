import { ChatOllama } from "@langchain/ollama";

export class CodeLlamaModel {
	private codeOllamaModel: ChatOllama;
	constructor(provider: string = "codeollama:7b", baseUrl: string) {
		this.codeOllamaModel = new ChatOllama({
			model: provider,
			baseUrl: baseUrl,
		});
	}
	getModel() {
		return this.codeOllamaModel;
	}
}
