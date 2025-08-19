import { Queue, Worker } from "bullmq";
import type { JobsOptions } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(
	process.env.REDIS_URL || "redis://127.0.0.1:6379"
);
export const reviewQueue = new Queue("pr-review", { connection });

export type ReviewJobData = { owner: string; repo: string; prNumber: number };

export async function enqueueReview(
	data: ReviewJobData,
	opts: JobsOptions = {
		attempts: 3,
		backoff: { type: "exponential", delay: 3000 },
	}
) {
	return reviewQueue.add("review", data, opts);
}
