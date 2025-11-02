import { prisma } from "db/prisma";
import { logger } from "logger";
import type { IssueGraphState } from "../../graphs/issueGraph";
import { getChromaStore } from "./embed";
import { embeddingModelName, embeddingModelUrl } from "../config";
import { OllamaEmbeddings } from "@langchain/ollama";
import { getAuthenticatedOctokit } from "github-config";
import { Send } from "@langchain/langgraph";

export const fetchRepoContext = async (state: typeof IssueGraphState.State) => {
	try {
		const repo = await prisma.repo.findUnique({
			where: {
				repoId: state.repoId,
			},
			include: {
				repoConfig: {
					include: {
						issueConfig: true,
					},
				},
				user: {
					select: {
						planName: true,
					},
				},
			},
		});
		if (!repo) {
			logger.warn(`Repo not found: Repo name ${state.repoName}`);
			throw new Error("Repo not found");
		}
		return {
			...state,
			repo,
			plan: repo.user.planName,
		};
	} catch (error) {
		logger.error(``);
	}
};

export const checkPreviousIssue = async (
	state: typeof IssueGraphState.State
) => {
	try {
		const {
			title,
			body,
			repoId,
			owner,
			repoName,
			issueNumber,
			installationId,
		} = state;

		const query = `${title}\n\n${body}`;

		const embeddingModel = new OllamaEmbeddings({
			model: embeddingModelName,
			baseUrl: embeddingModelUrl,
		});

		const queryEmbedded = await embeddingModel.embedQuery(query);
		const chromaStore = getChromaStore({ owner, repoName, issueNumber });

		const results = await chromaStore.similaritySearchVectorWithScore(
			queryEmbedded,
			3,
			{
				repoId: { $eq: repoId },
				$and: [{ repoId: { $eq: repoId }, issueNumber: { $eq: issueNumber } }],
			}
		);
		const topResult = results?.[0];
		const score = topResult?.[1] ?? 0;
		const similarIssue = topResult?.[0];

		if (similarIssue && score > 0.8) {
			const issueId = similarIssue.metadata?.issueNumber;

			if (issueId) {
				const octokit = await getAuthenticatedOctokit(installationId);
				await octokit.rest.issues.createComment({
					owner,
					repo: repoName,
					issue_number: issueNumber,
					body: `🧠 This issue looks similar to #${issueId}. Does that help?`,
				});

				logger.info(`Found similar issue: #${issueId}`);
			}
			return new Send("__end__", {});
		}

		logger.info("No similar issues found; moving to embedding stage.");
		return { ...state };
	} catch (error) {
		logger.error("Error in checkPreviousIssue", error);
		return { ...state };
	}
};
