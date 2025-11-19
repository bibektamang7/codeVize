import { logger } from "logger";
import { issueWorkflow } from "./issueGraph";
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
	console.log("this is in run graph for pr");
	const app = pullRequestWorkflow.compile();
	app.invoke({
		...graphInitialState,
	});
};
interface IssueGraphInitialState {
	installationId: number;
	repoName: string;
	repoId: string;
	owner: string;
	issueNumber: number;
	title: string;
	body: string;
}

export const runGraphForIssue = async (
	initialState: IssueGraphInitialState
) => {
	try {
		const app = issueWorkflow.compile();
		app.invoke({ ...initialState });
	} catch (error) {
		logger.warn(
			"Failed to execute workflow: repoName -> ",
			initialState.repoName
		);
	}
};
