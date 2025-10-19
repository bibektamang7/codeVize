import { pullRequestWorkflow } from "./pullRequestGraph";

interface GraphInitialStateProps {
	owner: string;
	repoId: string;
	prNumber: number;
	installationId: number;
	repoName: string;
}

export const runGraphForPR = async (
	graphInitialState: GraphInitialStateProps
) => {
	const app = pullRequestWorkflow.compile();
	app.invoke({
		...graphInitialState,
	});
};
