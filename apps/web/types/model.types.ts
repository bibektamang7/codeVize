export interface ReviewProps {
	id: string;
	reviewSummary: string;
	tags: string[];
	aiScore?: number;
	createdAt: Date;
	pullRequestId: string;
}

export interface IssueProps {
	id: string;
	title: string;
	body: string;
	state: string;
	tags: string[];
	createdAt: Date;
	repoId: string;
}

export interface PullRequestProps {
	id: string;
	prNumber: string;
	title: string;
	commitHash: string;
	state: string;
	createdAt: Date;
	reviews: ReviewProps[];
}

enum Tone {
	professional,
	casual,
	friendly,
	humorous,
	enthusiastic,
	empathetic,
	formal,
	informal,
}

export interface RepositoryProps {
	id: string;
	repoId: string;
	repoName: string;
	repoFullName: string;
	repoURL: string;
	languages: string[];
	isActive: boolean;
	user: User;
	createdAt: Date;
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
		};
		errorLogs?: RepoErrorLogProps[];
	};
}

export interface RepoErrorLogProps {
	id: string;
	message: string;
	type: string;
	number?: number;
	occurredAt: Date;
	resolved: boolean;
}

export interface Stats {
	totalTokensUsed: number;
	activeRepositories: number;
	totalUsers: number;
	totalPayments: number;
}
interface User {
	username: string;
	createdAt: Date;
}
interface Payment {
	amount: number;
	createdAt: Date;
}
export interface Activity {
	newUser: User | null;
	newRepositoryAdded: RepositoryProps | null;
	paymentReceived: Payment | null;
	pendingPaymentsCount: number;
}
