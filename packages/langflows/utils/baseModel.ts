export interface ModelResponse {
	tags: string[];
	reviewSummary: string;
	issuesFound: string[];
	suggestions: string[];
	commitHash: string;
	aiScore: number;
}

export abstract class BaseModel {
	abstract codeReviewChain(input: string): Promise<ModelResponse>;
}
