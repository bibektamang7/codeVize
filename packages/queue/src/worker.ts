import { Worker } from "bullmq";
import IoRedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const workerConnection = new IoRedis(REDIS_URL, { maxRetriesPerRequest: null });

// const HOST = process.env.REDIS_HOST || "localhost";
// const PORT = Number(process.env.REDIS_PORT) || 6379;

const trainRepoWorker = new Worker(
	"trainRepo",
	async (job) => {
		console.log(job.name);
	},
	{
		connection: workerConnection,
		autorun: true,
		concurrency: 1,
		removeOnComplete: {
			age: 60 * 60,
			count: 100
		},
		removeOnFail: {
			age: 24 * 60 * 60,
		},
		limiter :{
			max: 10,
			duration: 1000
		},
	}
);

trainRepoWorker.on("completed", (job) => {
	console.log(`${job.id} has completed`);
});

trainRepoWorker.on("failed", (job, err) => {
	console.log(`${job?.id} has failed with ${err.message}`);
});
