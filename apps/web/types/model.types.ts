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
	reviews: ReviewProps[]
}

export interface RepositoryProps {
	id: string;
	repoId: string;
	repoName: string;
	repoFullName: string;
	repoURL: string;
	languages: string[];
	isActive: boolean;
	pullRequests: PullRequestProps[];
	Issue: IssueProps[];
}
