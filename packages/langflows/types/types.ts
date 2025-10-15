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
		reviewConfig: {
			aiReviewEnabled: boolean;
			highLevelSummaryEnabled: boolean;
			showWalkThrough: boolean;
			pathConfigs: {
				pathPattern: string;
				instructions?: string;
				enabled: boolean;
			}[];
			labelConfigs: {
				label: string;
				instructions?: string;
				enabled: boolean;
			}[];
		};
	};
}

export interface RepoError {
	type: string;
	message: string;
}
