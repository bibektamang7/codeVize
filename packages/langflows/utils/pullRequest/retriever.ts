import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { ChromaClient } from "chromadb";
import type { Document } from "langchain/document";

import { PullRequestGraphState } from "../../graphs/graph";
import { getAuthenticatedOctokit } from "github-config";
import {
	embeddingModelName,
	embeddingModelUrl,
	vectorDBHost,
	vectorDBPort,
	vectorDBSSL,
} from "../config";
import {
	REVIEWED_COMMITS_BLOCK_END,
	REVIEWED_COMMITS_BLOCK_START,
	SUMMARIZE_TAG,
} from "..";
import { checkPathFilter } from "../utils";

export const retrieveWithParents = async (options: {
	query: string;
	kPerQuery?: number;
	maxParents?: number;
	neighbours?: number;
	owner: string;
	repo: string;
	installationId: number;
}) => {
	const {
		query,
		kPerQuery = 6,
		maxParents = 10,
		installationId,
		owner,
		repo,
	} = options;
	console.log("this is here i know now");
	const chromaClient = new ChromaClient({
		host: "localhost",
		port: 8000,
		ssl: false,
	});
	// const vectorStore = new Chroma(
	// 	new OllamaEmbeddings({
	// 		model: "",
	// 		baseUrl: "",
	// 	}),
	// 	{
	// 		collectionName: "",
	// 	}
	// );

	const embeddingModel = new OllamaEmbeddings({
		model: embeddingModelName,
		baseUrl: embeddingModelUrl,
	});

	const queryEmbeded = await embeddingModel.embedDocuments([query]);

	const chromaStore = new Chroma(embeddingModel, {
		collectionName: "repo_embeddings",
		collectionMetadata: {
			installationId: installationId,
			repoId: `${owner}/${repo}`,
		},
		clientParams: {
			host: vectorDBHost,
			port: vectorDBPort,
			ssl: vectorDBSSL,
		},
	});
	console.log("is this seach comeher and so do");
	// const hits = await chromaStore.similaritySearch(query, kPerQuery);
	const result = await chromaStore.similaritySearchVectorWithScore(
		//@ts-ignore
		queryEmbeded,
		kPerQuery,
		{
			// installationId: { $eq: installationId },
			repoId: { $eq: `${owner}/${repo}` },
		}
	);
	const hits = result.map((result) => result[0]);
	console.log("this is hits", hits);
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



export const retrievePRContext = async (
	State: typeof PullRequestGraphState.State
) => {
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

	// console.log("This is targed branch file", targetBranchDiff.data.files);
	// console.log(
	// 	"This is changed files data",
	// 	targetBranchDiff.data.files?.map((file) => file.patch)
	// );

	let highestReviewedCommitId: string | undefined;

	const commentsResponse = await octokit.rest.issues.listComments({
		owner: State.owner,
		repo: State.repo,
		issue_number: State.prNumber,
	});
	// find hte comment with the SUMMARIZE_TAG
	const botComment = commentsResponse.data.find((comment) =>
		comment.body?.includes(SUMMARIZE_TAG)
	);
	if (botComment && botComment.body) {
		const startTagIndex = botComment.body.indexOf(REVIEWED_COMMITS_BLOCK_START);
		const endTagIndex = botComment.body.indexOf(REVIEWED_COMMITS_BLOCK_END);
		if (startTagIndex !== -1 && endTagIndex !== -1) {
			const commitIdsBlock = botComment.body.substring(
				startTagIndex + REVIEWED_COMMITS_BLOCK_START.length,
				endTagIndex
			);
			//extract and process the commit IDs.
			const reviewedCommitIds = commitIdsBlock
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0);

			const commitsResponse = await octokit.rest.pulls.listCommits({
				owner: State.owner,
				repo: State.repo,
				pull_number: State.prNumber,
			});

			const allCommitIds = commitsResponse.data.map((commit) => commit.sha);
			for (let i = allCommitIds.length - 1; i >= 0; i--) {
				const commitId = allCommitIds[i];
				if (commitId && reviewedCommitIds.includes(commitId)) {
					highestReviewedCommitId = allCommitIds[i];
					break;
				}
			}
		}
	}

	const baseSha = highestReviewedCommitId ?? pr.data.base.sha;

	let incrementalDiff = null;
	if (baseSha !== pr.data.base.sha) {
		incrementalDiff = await octokit.request(
			"GET /repos/{owner}/{repo}/compare/{base}...{head}",
			{
				owner: State.owner,
				repo: State.repo,
				base: baseSha,
				head: pr.data.head.sha,
			}
		);
	} else {
		incrementalDiff = targetBranchDiff;
	}

	const commits = incrementalDiff.data.commits;
	if (commits.length === 0) {
		console.log("Skipped: commits is null");
		return;
	}

	const incrementalFiles = incrementalDiff.data.files || [];
	const targetBranchFiles = targetBranchDiff.data.files;
	if (!targetBranchFiles || targetBranchFiles.length === 0) {
		console.log("Skipped: files data is missing");
		return;
	}
	const files = targetBranchFiles.filter((targetBranchFile) => {
		return incrementalFiles.some(
			(incrementalFile) =>
				incrementalFile.filename === targetBranchFile.filename
		);
	});
	console.log("this is files after filter", files);
	if (files.length === 0) {
		console.log("Skipped: files is null");
		return;
	}

	if (files.length === 0) {
		console.log("Skipped: files is null");
		return;
	}
	const filterSelectedFiles = [];
	const filterIgnoredFiles = [];

	for (const file of files) {
		if (checkPathFilter(file.filename)) {
			filterSelectedFiles.push(file);
		} else {
			filterIgnoredFiles.push(file);
		}
	}

	if (filterSelectedFiles.length === 0) {
		console.log("Skipped: filteredSelectedFiles is null");
		return;
	}
	// State.unReviewedFiles = filterSelectedFiles;
	return {
		unReviewedFiles: filterSelectedFiles,
		commits: commits,
	};
};

export const retrieveContextFromVectorDB = async ({
	State,
}: typeof PullRequestGraphState) => {
	const chromaClient = new ChromaClient({
		host: vectorDBHost,
		port: Number(vectorDBPort),
		ssl: vectorDBSSL,
	});

	const embeddingModel = new OllamaEmbeddings({
		model: embeddingModelName,
		baseUrl: embeddingModelUrl,
	});

	const chromaStore = new Chroma(embeddingModel, {
		collectionName: "repo_embeddings",
		clientParams: {
			host: vectorDBHost,
			port: vectorDBPort,
			ssl: vectorDBSSL,
		},
	});
	// const similaritySearch = await vectorStore.similaritySearch(

	// 	4
	// );
};
type DiffHunk = {
	filePath: string;
	header: string; // e.g., @@ -10,6 +10,9 @@
	code: string; // the actual changed snippet (with +/-/context lines)
	added: string[]; // lines added
	removed: string[]; // lines removed
};

//TODO: For future improvement
// const SUMMARIZED_TAG = "";
// export const findCommentWithTag = (tag: string, prNumber: number) => {

// };

export const extractDiffHunks = (
	diff: string,
	filePath: string
): DiffHunk[] => {
	const lines = diff.split("\n");
	const hunks: DiffHunk[] = [];

	let currentHunk: DiffHunk | null = null;

	for (const line of lines) {
		if (line.startsWith("@@")) {
			if (currentHunk) {
				hunks.push(currentHunk);
			}
			currentHunk = {
				header: line,
				code: "",
				added: [],
				removed: [],
				filePath,
			};
		} else if (currentHunk) {
			currentHunk.code += line + "\n";
			if (line.startsWith("+") && !line.startsWith("+++")) {
				currentHunk.added.push(line.slice(1));
			} else if (line.startsWith("-") && !line.startsWith("---")) {
				currentHunk.removed.push(line.slice(1));
			}
		}
	}
	if (currentHunk) hunks.push(currentHunk);

	return hunks;
};

const parsedHunkHeader = (header: string) => {
	const match = /@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(header);
	if (!match) return null;

	const oldStart = parseInt(match[1]!, 10);
	const oldLines = match[2] ? parseInt(match[2], 10) : 1;
	const newStart = parseInt(match[3]!, 10);
	const newLines = match[4] ? parseInt(match[4], 10) : 1;

	return { oldStart, oldLines, newStart, newLines };
};

export const findAnchorLine = (hunk: DiffHunk) => {
	const parsed = parsedHunkHeader(hunk.header);
	if (!parsed) return null;

	const { newStart } = parsed;

	// count lines in hunk.code until we hit a '+' (added line)
	const lines = hunk.code.split("\n");
	let offset = 0;

	for (const line of lines) {
		if (line.startsWith("+") && !line.startsWith("+++")) {
			return newStart + offset;
		}
		if (!line.startsWith("-")) {
			offset++;
		}
	}
	return newStart;
};
