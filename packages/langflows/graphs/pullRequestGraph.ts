import { Annotation, StateGraph, Send } from "@langchain/langgraph";
import { retrievePRFiles } from "../utils/pullRequest/retriever";
import type { Commits, PullRequestFiles } from "github-config";
import { prisma } from "db/prisma";
import type { Repo, RepoError } from "../types/types";
import { tabularPRDiffSummary } from "../utils/pullRequest/summary";
import { checkBugsOrImprovement } from "../utils/pullRequest/suggestion";
import { getCodeSummarizationModel } from "../utils/codeSummarizationLLMFactory";
import { getAuthenticatedOctokit } from "github-config";

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

The summary should:
- Briefly explain the main purpose of the pull request in bullet points
- Outline key changes made
- Mention the expected impact or benefits
- Be concise but informative
- Match the specified tone

The summary must be within 150 words range.

High-level Summary:`;

	try {
		const summarizationModel = getCodeSummarizationModel();
		const summaryResponse = await summarizationModel.invoke([
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
		console.log("this is state", state);
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
	.addNode("checkBugsOrImprovement", checkBugsOrImprovement)
	.addNode("errorOccured", handleErrorOccuredNode)
	.addConditionalEdges(
		"retrievePRFiles",
		(state: typeof PullRequestGraphState.State) => {
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
			console.log(
				"this is after tabularpr file summary",
				state.repo.repoConfig?.reviewConfig
			);
			if (
				state.repo.repoConfig &&
				!state.repo.repoConfig.reviewConfig.aiReviewEnabled
			) {
				console.log("then its here");
				return "__end__";
			}
			return "checkBugsOrImprovement";
		}
	)
	.addEdge("__start__", "validation")
	.addEdge("validation", "retrievePRFiles")
	.addEdge("checkBugsOrImprovement", "__end__")
	.addEdge("errorOccured", "__end__");
