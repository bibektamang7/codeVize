import { Annotation, StateGraph, Send } from "@langchain/langgraph";
import { retrievePRFiles } from "../utils/pullRequest/retriever";
import type { Commits, PullRequestFiles } from "github-config";
import { prisma } from "db/prisma";
import type { Repo, RepoError } from "../types/types";
import { tabularPRDiffSummary } from "../utils/pullRequest/summary";
import { checkBugsOrImprovement } from "../utils/pullRequest/suggestion";

export const PullRequestGraphState = Annotation.Root({
	installationId: Annotation<number>,
	owner: Annotation<string>,
	repoName: Annotation<string>,
	repoId: Annotation<string>,
	prNumber: Annotation<number>,
	unReviewedFiles: Annotation<PullRequestFiles>,
	diff: Annotation<string>,
	retrievedDocs: Annotation<string[]>,
	prompt: Annotation<string>,
	review: Annotation<string>,
	vectorContext: Annotation<string>,
	commits: Annotation<Commits>,
	embeddingsAvailable: Annotation<boolean>,
	repo: Annotation<Repo>,
	error: Annotation<RepoError>,
});

const validationNode = async (state: typeof PullRequestGraphState.State) => {
	console.log(
		`Validating PR #${state.prNumber} for ${state.owner}/${state.repoName}`
	);
	const repo = await prisma.repo.findUnique({
		where: {
			repoId: state.repoId,
			isActive: true,
		},
		include: {
			repoConfig: {
				include: {
					reviewConfig: {
						include: {
							pathConfigs: true,
							labelConfigs: true,
						},
					},
					generalConfig: true,
				},
			},
		},
	});

	if (!repo) {
		console.error(
			`Repo ${state.owner}/${state.repoName} not found in database`
		);
		return {
			error: `Repo ${state.owner}/${state.repoName} not found in database`,
		};
	}

	if (!repo.isActive) {
		console.log(
			`Repo ${state.owner}/${state.repoName} is not active, skipping review`
		);
		return { validationStatus: "repo_inactive" };
	}

	const repoConfiguration = repo.repoConfig;
	if (!repoConfiguration) {
		console.error(
			`Review configuration not found for repo ${state.owner}/${state.repoName}`
		);
		return new Send("errorOccured", {
			error: {
				type: "Repo Configuration",
				message: `Review configuration not found for repo ${state.owner}/${state.repoName}`,
			},
		});
	}

	return {
		repo: {
			repoConfig: {
				reviewConfig: repoConfiguration.reviewConfig,
				generalConfig: repoConfiguration.generalConfig,
			},
		},
	};
};

const highLevelSummaryNode = async (
	state: typeof PullRequestGraphState.State
) => {
	console.log(`Generating high level summary for PR #${state.prNumber}`);

	const repo = await prisma.repo.findUnique({
		where: {
			repoId: state.repoId,
		},
		include: {
			repoConfig: {
				include: {
					reviewConfig: true,
					generalConfig: true,
				},
			},
		},
	});

	// Here we would implement the high level summary logic
	// For now, we'll just return an empty object to continue the workflow
	return {};
};

const handleErrorOccuredNode = async (
	state: typeof PullRequestGraphState.State
) => {
	try {
		const error = state.error || {
			type: "Pull Request",
			message: "Something went wrong to summarize or review PR",
		};
		if (!state.repo.repoConfig) {
			throw new Error(`${state.repoName}'s repoConfig is not set`);
		}

		await prisma.repoErrorLog.create({
			data: {
				message: error.message,
				type: error.type,
				repoConfigId: state.repo.repoConfig.id,
			},
		});
		console.log("Repo error created");
	} catch (error) {
		console.log("something went wrong on error occured node", error);
	}
};


export const pullRequestWorkflow = new StateGraph(PullRequestGraphState)
	.addNode("validation", validationNode)
	.addNode("highLevelSummary", highLevelSummaryNode)
	.addNode("tabularPRFilesSummarize", tabularPRDiffSummary)
	.addNode("retrievePRFiles", retrievePRFiles)
	// .addNode("retrievePRContext", retrievePRContext)
	.addNode("checkBugsOrImprovement", checkBugsOrImprovement)
	.addNode("errorOccured", handleErrorOccuredNode)
	.addEdge("validation", "highLevelSummary")
	.addEdge("highLevelSummary", "tabularPRFilesSummarize")
	.addEdge("tabularPRFilesSummarize", "retrievePRFiles")
	.addConditionalEdges(
		"validation",
		(state: typeof PullRequestGraphState.State) => {
			if (state.error.message && state.error.message.length > 0) {
				return "errorOccured";
			}
			if (
				state.repo.repoConfig &&
				!state.repo.repoConfig.reviewConfig.highLevelSummaryEnabled
			) {
				return "tabularPRFilesSummarize";
			}
			return "highLevelSummary";
		}
	)
	.addConditionalEdges(
		"highLevelSummary",
		(state: typeof PullRequestGraphState.State) => {
			if (
				state.repo.repoConfig &&
				!state.repo.repoConfig.reviewConfig.showWalkThrough
			) {
				return "retrievePRFiles";
			}
			return "tabularPRFilesSummarize";
		}
	)
	.addConditionalEdges(
		"tabularPRFilesSummarize",
		(state: typeof PullRequestGraphState.State) => {
			if (
				state.repo.repoConfig &&
				!state.repo.repoConfig.reviewConfig.aiReviewEnabled
			) {
				return "__end__";
			}
			return "retrievePRFiles";
		}
	)
	.addEdge("retrievePRFiles", "checkBugsOrImprovement")
	// .addEdge("retrievePRContext", "checkBugsOrImprovement")
	.addEdge("checkBugsOrImprovement", "__end__")
	.addEdge("errorOccured", "__end__");
