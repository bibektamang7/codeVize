import { Worker } from "bullmq";
import { connection } from "./queue";
import { runGraphForPR } from "../graphs/index"; // reuse the function exported from main file

export const worker = new Worker(
	"pr-review",
	async (job) => {
		const { owner, repo, prNumber, installationId } = job.data as any;
		const graphInitialState = { owner, repo, prNumber, installationId };
		await runGraphForPR(graphInitialState);
	},
	{ connection }
);
