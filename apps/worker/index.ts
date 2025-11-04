import { Redis } from "ioredis";
import { QueueEvents, Worker } from "bullmq";
import { logger } from "logger";
import type { Job } from "bullmq";
import {
	runGraphForPR,
	deleteEmbedRepo,
	embedRepoChain,
	runGraphForIssue,
} from "langflows";

export const redisConnection = new Redis(process.env.REDIS_URL!, {
	maxRetriesPerRequest: null,
	enableReadyCheck: false,
});

const repoWorker = new Worker(
	"github-job",
	async (job: Job) => {
		switch (job.name) {
			case "review": {
				console.log("this is running")
				const { owner, prNumber, installationId, repoId, repoName } = job.data;
				await runGraphForPR({
					prNumber,
					installationId,
					owner,
					repoId,
					repoName,
				});
				break;
			}
			case "issue-triage": {
				await runGraphForIssue({ ...job.data });
				break;
			}

			case "embed-repo": {
				const { installationId, owner, repo } = job.data;
				await embedRepoChain(installationId, owner, repo);
				break;
			}

			case "delete-embedding":
				await deleteEmbedRepo(job.data);
				break;
		}
	},
	{
		connection: redisConnection as any,
		concurrency: 5,
		limiter: {
			max: 10,
			duration: 1000,
		},
		lockDuration: 60000,
	}
);
repoWorker.on("failed", (job, err) => {
	logger.error(`Repo job failed`, { jobId: job?.id, error: err.message });
});
repoWorker.on("ready", () => {
	logger.info("Worker is ready");
});

const events = new QueueEvents("github-job", {
	connection: redisConnection as any,
});
events.on("completed", ({ jobId }) => {
	logger.info(`Job ${jobId} completed`);
});
events.on("failed", ({ jobId, failedReason }) => {
	logger.error(`Job ${jobId} failed: ${failedReason}`);
});

const shutdown = async () => {
	logger.info("Shutting down worker...");
	await repoWorker.close();
	await redisConnection.quit();
	process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
