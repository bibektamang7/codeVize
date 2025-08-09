import { Queue } from "bullmq";
import IoRedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const conneciton = new IoRedis(REDIS_URL, { maxRetriesPerRequest: null });

// const HOST = process.env.REDIS_HOST || "localhost";
// const PORT = Number(process.env.REDIS_PORT) || 6379;

const trainRepoQueue = new Queue("trainRepo", {
	connection: conneciton,
});

async function TrainRepo() {
	await trainRepoQueue.add("addRepoContext", {});
}

export { TrainRepo };
