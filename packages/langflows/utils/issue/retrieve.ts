import { prisma } from "db/prisma";
import { logger } from "logger";
import type { IssueGraphState } from "../../graphs/issueGraph";
import { Send } from "@langchain/langgraph";

export const fetchRepoContext = async (state: typeof IssueGraphState.State) => {
	try {
		console.log("this is in fetch repo context");
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
		logger.error(`Error while fetching repo context`);
		return new Send("__end__", {});
	}
};
