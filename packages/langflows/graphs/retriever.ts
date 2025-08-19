import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { ChromaClient } from "chromadb";
import type { Document } from "langchain/document";

import { PullRequestGraphState } from "./graph";
import { getAuthenticatedOctokit } from "github-config";

export const retrieveWithParents = async (options: {
	query: string;
	kPerQuery?: number;
	maxParents?: number;
	neighbours?: number;
}) => {
	const { query, kPerQuery = 6, maxParents = 10 } = options;
	const chromaClient = new ChromaClient({
		host: "localhost",
		port: 8000,
		ssl: false,
	});
	const vectorStore = new Chroma(
		new OllamaEmbeddings({
			model: "",
			baseUrl: "",
		}),
		{
			collectionName: "",
		}
	);
	const hits = await vectorStore.similaritySearch(query, kPerQuery);
	const byParent = new Map<string, Document[]>();
	for (const h of hits) {
		const parentId = h.metadata.parentId;
		if (!byParent.has(parentId)) byParent.set(parentId, []);
		byParent.get(parentId)?.push(h);
	}
	const parents = Array.from(byParent.entries()).slice(0, maxParents);
	const expanded: Document[] = [];

	for (const [, docs] of parents) {
		const sorted = docs.sort(
			(a, b) => (a.metadata.start ?? 0) - (b.metadata.start ?? 0)
		);
		for (const d of sorted) {
			expanded.push(d);
		}
	}
	return expanded;
};

export const retrievePRContent = async ({
	State,
}: typeof PullRequestGraphState) => {
	const octokit = await getAuthenticatedOctokit(State.installationId);

	const pr = await octokit.rest.pulls.get({
		owner: State.owner,
		repo: State.repo,
		pull_number: State.prNumber,
	});

	const targetBranchDiff = await octokit.request(
		"GET /repos/{owner}/{repo}/compare/{base}...{head}",
		{
			owner: State.owner,
			repo: State.repo,
			base: pr.data.base.sha,
			head: pr.data.head.sha,
		}
	);
	targetBranchDiff.data.files;
};

export const retrieveContextFromVectorDB = async ({
	State,
}: typeof PullRequestGraphState) => {};
