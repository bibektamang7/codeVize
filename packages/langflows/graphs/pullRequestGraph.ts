import { Annotation, StateGraph, Send } from "@langchain/langgraph";
import { retrievePRFiles } from "../utils/pullRequest/retriever";
import type { Commits, PullRequestFiles } from "github-config";
import { prisma } from "db/prisma";
import type { Repo, RepoError } from "../types/types";
import { tabularPRDiffSummary } from "../utils/pullRequest/summary";
import { checkBugsOrImprovement } from "../utils/pullRequest/suggestion";
import { getCodeSummarizationModel } from "../utils/codeSummarizationLLMFactory";
import { getAuthenticatedOctokit } from "github-config";
import { highLevelPRSummaryPrompt } from "../prompts/reviewPrompt";
import { simulateNodeExecution } from "../utils/mock";

type RepoConfigFiles = Record<string, string>;

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
	repoConfigFiles: Annotation<RepoConfigFiles>,
});

const validationNode = async (state: typeof PullRequestGraphState.State) => {
	const repo = await prisma.repo.findUnique({
		where: {
			repoId: state.repoId,
			isActive: true,
		},
		include: {
			user: {
				select: {
					id: true,
				},
			},
			repoConfig: {
				include: {
					reviewConfig: true,
					generalConfig: true,
				},
			},
		},
	});

	if (!repo) {
		console.error(
			`Repo ${state.owner}/${state.repoName} not found in database`
		);
		return new Send("__end__", {});
	}

	const repoConfiguration = repo.repoConfig;
	if (!repoConfiguration) {
		console.error(
			`Review configuration not found for repo ${state.owner}/${state.repoName}`
		);
		return new Send("errorOccured", {
			...state,
			error: {
				type: "Repo Configuration",
				message: `Review configuration not found for repo ${state.owner}/${state.repoName}`,
			},
		});
	}

	return {
		...state,
		repo,
	};
};

const highLevelSummaryNode = async (
	state: typeof PullRequestGraphState.State
) => {
	console.log(`Generating high level summary for PR #${state.prNumber}`);

	const tone = state.repo.repoConfig?.generalConfig?.tone || "professional";

	const filteredFiles = state.unReviewedFiles;
	if (!filteredFiles || filteredFiles.length === 0) {
		console.warn("Skipped: No files to review");
		return;
	}
	let combinedDiff = "";
	for (const file of filteredFiles) {
		if (file.patch) {
			combinedDiff += `\n\n--- ${file.filename} ---\n\n`;
			combinedDiff += file.patch;
		}
	}

	let toneInstruction = "";
	switch (tone.toLowerCase()) {
		case "casual":
			toneInstruction = "Write in a casual, friendly tone.";
			break;
		case "friendly":
			toneInstruction = "Write in a friendly, approachable tone.";
			break;
		case "humorous":
			toneInstruction =
				"Include light humor where appropriate while keeping it professional.";
			break;
		case "enthusiastic":
			toneInstruction = "Write with enthusiasm and positive energy.";
			break;
		case "empathetic":
			toneInstruction =
				"Write with empathy, considering the impact on users and team members.";
			break;
		case "formal":
			toneInstruction = "Write in a formal, professional tone.";
			break;
		case "informal":
			toneInstruction = "Write in an informal, conversational tone.";
			break;
		case "professional":
		default:
			toneInstruction = "Write in a professional, clear tone.";
			break;
	}

	const summaryPrompt = `Generate a high-level summary of this pull request.
	

The tone of the output should be:
${toneInstruction}

## Diff
\`\`\`diff
${combinedDiff}
\`\`\`

High-level Summary:`;

	try {
		const summarizationModel = getCodeSummarizationModel();
		const summaryResponse = await summarizationModel.invoke([
			{
				role: "system",
				content: highLevelPRSummaryPrompt,
			},
			{
				role: "user",
				content: summaryPrompt,
			},
		]);

		const octokit = await getAuthenticatedOctokit(state.installationId);
		const summarySubmit = await octokit.request(
			"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
			{
				owner: state.owner,
				repo: state.repoName,
				issue_number: state.prNumber,
				body: `## High-Level Summary\n\n${summaryResponse.text}`,
			}
		);

		console.log(
			"Successfully posted high-level summary to the pull request.",
			summarySubmit.data.author_association
		);

		return { ...state, review: summaryResponse.text };
	} catch (error: any) {
		console.error("Failed to generate high-level summary for PR", error);
		return new Send("errorOccured", {
			...state,
			error: {
				type: "High-Level Summary",
				message:
					error.message ||
					`Failed to generate high-level summary for PR\n: ${error}`,
			},
		});
	}
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

const isTestMode = process.env.TEST_MODE === "simulate" || false;

const wrapNode = (nodeName: string, realNode: Function, time: number) => {
	return async (state: typeof PullRequestGraphState.State) => {
		if (isTestMode) {
			return simulateNodeExecution(nodeName, state, time);
		}
		return realNode(state);
	};
};

export const pullRequestWorkflow = new StateGraph(PullRequestGraphState)
	.addNode("validation", validationNode)
	.addNode(
		"highLevelSummary",
		wrapNode("highLevelSummary", highLevelSummaryNode, 1350)
	)
	.addNode(
		"tabularPRFilesSummarize",
		wrapNode("tabularPRFilesSummarize", tabularPRDiffSummary, 1150)
	)
	.addNode(
		"retrievePRFiles",
		wrapNode("retrievePRFiles", retrievePRFiles, 1000)
	)
	.addNode(
		"checkBugsOrImprovement",
		wrapNode("checkBugsOrImprovement", checkBugsOrImprovement, 1200)
	)
	.addNode("errorOccured", handleErrorOccuredNode)
	.addConditionalEdges(
		"retrievePRFiles",
		(state: typeof PullRequestGraphState.State) => {
			console.log("this is tate", state);
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
				return "checkBugsOrImprovement";
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
			return "checkBugsOrImprovement";
		}
	)
	.addEdge("__start__", "validation")
	.addEdge("validation", "retrievePRFiles")
	.addEdge("checkBugsOrImprovement", "__end__")
	.addEdge("errorOccured", "__end__");
