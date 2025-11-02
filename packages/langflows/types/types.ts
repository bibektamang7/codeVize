import { Tone } from "db/prisma";

export interface Repo {
	id: string;
	isActive: boolean;
	repoConfig?: {
		id: string;
		generalConfig: {
			tone: Tone;
			enableFreeTier: boolean;
			defaultModel?: string;
		};
		issueConfig: {
			id: string;
			aiIssueTriageEnabled: boolean;
			issueEmbedEnabled: boolean;
		};
		reviewConfig: {
			aiReviewEnabled: boolean;
			highLevelSummaryEnabled: boolean;
			showWalkThrough: boolean;
			isProgressFortuneEnabled: boolean;
			poemEnabled: boolean;
			// pathConfigs: {
			// 	pathPattern: string;
			// 	instructions?: string;
			// 	enabled: boolean;
			// }[];
			// labelConfigs: {
			// 	label: string;
			// 	instructions?: string;
			// 	enabled: boolean;
			// }[];
		};
	};
}

export interface RepoError {
	type: string;
	message: string;
}

export interface IssueAnalysis {
	category: string;
	priority: string;
}
