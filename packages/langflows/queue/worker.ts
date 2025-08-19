import { Worker } from "bullmq";
import { connection } from "./queue";
import { runGraphForPR } from "../graphs/index"; // reuse the function exported from main file

export const worker = new Worker(
	"pr-review",
	async (job) => {
		const { owner, repo, prNumber } = job.data as any;
		await runGraphForPR(owner, repo, prNumber);
	},
	{ connection }
);
