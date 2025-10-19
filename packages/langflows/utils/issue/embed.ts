import { Chroma } from "@langchain/community/vectorstores/chroma";
import type { IssueGraphState } from "../../graphs/issueGraph";
import {
	embeddingModelName,
	embeddingModelUrl,
	vectorDBHost,
	vectorDBPort,
	vectorDBSSL,
} from "../config";
import { OllamaEmbeddings } from "@langchain/ollama";

export const getChromaStore = ({
	owner,
	repoName,
	issueNumber,
}: {
	owner: string;
	repoName: string;
	issueNumber: number;
}) => {
	const embeddingModel = new OllamaEmbeddings({
		model: embeddingModelName,
		baseUrl: embeddingModelUrl,
	});
	const chromaStore = new Chroma(embeddingModel, {
		collectionName: "repo_embeddings",
		collectionMetadata: {
			issueNumber: `${owner}/${repoName}/${issueNumber}`,
		},
		clientParams: {
			host: vectorDBHost,
			port: vectorDBPort,
			ssl: vectorDBSSL,
		},
	});
	return chromaStore;
};

export const embedIssue = async (state: typeof IssueGraphState.State) => {
	try {
		const { title, body, repoId, repoName, owner, issueNumber } = state;

		const content = `${title}\n\n${body}`;
		const chromaStore = getChromaStore({ owner, repoName, issueNumber });

		await chromaStore.addDocuments([
			{
				pageContent: content,
				metadata: {
					repoId,
					owner,
					repoName,
					issueNumber,
				},
			},
		]);

		console.log(`✅ Embedded issue #${issueNumber} for repo ${repoName}`);
		return state;
	} catch (error) {}
};
