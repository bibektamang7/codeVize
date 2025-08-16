import { OllamaEmbeddings } from "@langchain/ollama";
import { getAuthenticatedOctokit } from "github-config";
import {
	embeddingModelName,
	embeddingModelUrl,
	vectorDBHost,
	vectorDBPort,
	vectorDBSSL,
} from "../utils/config";
import { Chroma } from "@langchain/community/vectorstores/chroma";

export const embedPullRequest = async (
	owner: string,
	repo: string,
	prNumber: number,
	installationId: number
) => {
	const octokit = await getAuthenticatedOctokit(installationId);

	const pr = await octokit.rest.pulls.get({
		owner,
		repo,
		pull_number: prNumber,
	});
	if (!pr.data.state) {
		console.log("Pull request not found");
		return;
	}

	const embeddingModel = new OllamaEmbeddings({
		model: embeddingModelName,
		baseUrl: embeddingModelUrl,
	});
	const chromaStore = new Chroma(embeddingModel, {
		clientParams: {
			host: vectorDBHost,
			port: vectorDBPort,
			ssl: vectorDBSSL,
		},
	});
	// await chromaStore.addDocuments();
};
