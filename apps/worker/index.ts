import { Redis } from "ioredis";
import { Worker } from "bullmq";
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
	}
);
repoWorker.on("failed", (job, err) => {
	logger.error(`Repo job failed`, { jobId: job?.id, error: err.message });
});
