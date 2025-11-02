// import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";

export const getCodeSuggestionModel = (): ChatOpenAI => {
	const model = new ChatOpenAI({
		openAIApiKey: process.env.GROQ_API_KEY,
		model: "llama-3.3-70b-versatile",
		temperature: 0.3,
		configuration: {
			baseURL: "https://api.groq.com/openai/v1",
			apiKey: process.env.GROQ_API_KEY,
		},
	});
	return model;
};
