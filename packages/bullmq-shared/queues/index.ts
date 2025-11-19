import { Queue } from "bullmq";
import type { QueueOptions, JobsOptions } from "bullmq";
import Redis from "ioredis";

const redisConnection = new Redis(process.env.REDIS_URL!, {
	// username: "default",
	// password: process.env.REDIS_PASSWORD,
	// host: process.env.REDIS_HOST,
	// port: Number(process.env.REDIS_PORT) || 6379,
	maxRetriesPerRequest: null,
	enableReadyCheck: true,
	reconnectOnError: (err) => {
		const targetErrors = ["READONLY", "ETIMEOUT", "ECONNRESET", "ECONNREFUSED"];
		if (targetErrors.some((e) => err.message.includes(e))) {
			console.warn("Redis reconnecting after error:", err.message);
			return true;
		}
		return false;
	},
	retryStrategy(times) {
		const delay = Math.min(50 * Math.pow(2, times), 5000);
		console.warn(`Redis retrying connection in ${delay} ms...`);
		return delay;
	},
});

const queueOptions: QueueOptions = {
	connection: redisConnection,
	defaultJobOptions: {
		attempts: 3,
		backoff: { type: "exponential", delay: 5000 },
		removeOnComplete: true,
		removeOnFail: true,
	},
};

export const githubQueue = new Queue("github-job", queueOptions);

interface DeleteEmbeddingData {
	installationId: number;
	repoId: string;
	owner: string;
	repoName: string;
}

export const deleteEmbedding = (
	data: DeleteEmbeddingData,
	opts: JobsOptions = {
		attempts: 3,
		backoff: { type: "exponential", delay: 3000 },
	}
) => {
	return githubQueue.add("delete-embedding", data, opts);
};

export type ReviewJobData = {
	owner: string;
	installationId: number;
	repoId: string;
	prNumber: number;
	repoName: string;
};

export const enqueueReview = (
	data: ReviewJobData,
	opts: JobsOptions = {
		attempts: 3,
		backoff: { type: "exponential", delay: 3000 },
	}
) => {
	return githubQueue.add("review", data, opts);
};

// interface EmbedRepoData {
// 	installationId: number;
// 	owner: string;
// 	repo: string;
// }
// export const embedRepo = (
// 	data: EmbedRepoData,
// 	opts: JobsOptions = {
// 		attempts: 3,
// 		backoff: { type: "exponential", delay: 3000 },
// 	}
// ) => {
// 	return githubQueue.add("embed-repo", data, opts);
// };

interface IssueTriageData {
	installationId: number;
	repoName: string;
	repoId: string;
	owner: string;
	issueNumber: number;
	title: string;
	body: string;
}

export const issueTriageSuggestion = (data: IssueTriageData) => {
	return githubQueue.add("issue-triage", data, {
		attempts: 3,
		backoff: { type: "exponential", delay: 3000 },
	});
};
