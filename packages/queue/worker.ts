import { Worker } from "bullmq";
import { RedisClient } from "bun";

const redisClient = new RedisClient();

const trainRepoWorker = new Worker("trainRepo", async (job) => {
	console.log(job.name);
});

trainRepoWorker.on("completed", (job) => {
	console.log(`${job.id} has completed`);
});

trainRepoWorker.on("failed", (job, err) => {
	console.log(`${job?.id} has failed with ${err.message}`);
});
