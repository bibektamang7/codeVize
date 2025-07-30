import { Queue } from "bullmq";

const trainRepoQueue = new Queue("trainRepo");

async function TrainRepo() {
	await trainRepoQueue.add("addRepoContext", {});
}

export { TrainRepo };
