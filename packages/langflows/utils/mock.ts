import type { PullRequestGraphState } from "../graphs/pullRequestGraph";
export const simulateTIme = async (time: number, message: string) => {
	return await new Promise((resolve) =>
		setTimeout(() => {
			resolve(message);
		}, time)
	);
};

export async function simulateNodeExecution(
	nodeName: string,
	state: typeof PullRequestGraphState.State,
	time: number
) {
	console.log(`[SIMULATION] Executing ${nodeName} for ${time}ms`);
	await simulateTIme(time, `Simulated ${nodeName} output`);

	switch (nodeName) {
		case "highLevelSummary":
		case "tabularPRFilesSummarize":
			return {
				...state,
				review: `${nodeName} simulated output`,
			};
		case "retrievePRFiles":
			return {
				...state,
				unReviewedFiles: [],
				commits: [],
				repoConfigFiles: {},
			};
		case "checkBugsOrImprovement":
			return {
				...state,
			};
		default:
			return state;
	}
}
