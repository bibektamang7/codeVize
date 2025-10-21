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
	const app = issueWorkflow.compile();
	app.invoke({ ...initialState });
};
