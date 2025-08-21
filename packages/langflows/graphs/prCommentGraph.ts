// import { Annotation } from "@langchain/langgraph";
// import { StateGraph } from "@langchain/langgraph";

// const GlobalState = Annotation.Root({
// 	systemMessage: Annotation<string>,
// 	repoId: Annotation<string>,
// 	prNumber: Annotation<string | null>,
// 	diffText: Annotation<string | null>,
// 	repoChuncks: Annotation<Array<string>>,
// 	prChunks: Annotation<Array<string>>,
// 	summary: Annotation<string>,
// });

// const graph = new StateGraph(GlobalState);

// =============================================
// ADDITIONS: Indexer, ParentDoc Retriever, Inline Comments, BullMQ Queue
// =============================================

// File: src/indexer.ts
// Purpose: Build/refresh a Chroma collection for a repo at app install or on-demand.
// Strategy: Walk GitHub repo contents, filter source files, chunk into child docs, store parent+child in Chroma.

// import { Octokit } from "octokit";
// import path from "path";
// import { ChromaClient } from "chromadb";
// import { Chroma } from "@langchain/community/vectorstores/chroma";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { Document } from "@langchain/core/documents";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// const SOURCE_INCLUDE = [
// 	".ts",
// 	".tsx",
// 	".js",
// 	".jsx",
// 	".py",
// 	".go",
// 	".java",
// 	".rb",
// 	".rs",
// 	".cs",
// 	".json",
// 	".md",
// 	".yml",
// 	".yaml",
// 	".toml",
// ];
// const EXCLUDE_DIRS = new Set([
// 	"node_modules",
// 	".git",
// 	"dist",
// 	"build",
// 	".next",
// 	".cache",
// ]);

// export async function indexRepoToChroma(params: {
// 	owner: string;
// 	repo: string;
// 	branch?: string;
// 	collectionName: string;
// }) {
// 	const { owner, repo, branch = "main", collectionName } = params;
// 	const appId = process.env.GITHUB_APP_ID as string;
// 	const privateKey = (process.env.GITHUB_PRIVATE_KEY || "").replace(
// 		/\\n/g,
// 		"\n"
// 	);
// 	const githubApp = new (require("octokit").App)({ appId, privateKey });
// 	const { data: installation } = await githubApp.octokit.request(
// 		"GET /repos/{owner}/{repo}/installation",
// 		{ owner, repo }
// 	);
// 	const octokit: Octokit = await (githubApp as any).getInstallationOctokit(
// 		installation.id
// 	);

// 	async function listFilesRecursive(
// 		dir: string
// 	): Promise<Array<{ path: string; sha: string; type: string }>> {
// 		const { data } = await octokit.request(
// 			"GET /repos/{owner}/{repo}/contents/{path}",
// 			{
// 				owner,
// 				repo,
// 				path: dir,
// 				ref: branch,
// 			}
// 		);
// 		const out: Array<{ path: string; sha: string; type: string }> = [];
// 		for (const item of data as any[]) {
// 			const name = item.name as string;
// 			if (item.type === "dir") {
// 				if (EXCLUDE_DIRS.has(name)) continue;
// 				out.push(...(await listFilesRecursive(item.path)));
// 			} else if (item.type === "file") {
// 				const ext = path.extname(name).toLowerCase();
// 				if (SOURCE_INCLUDE.includes(ext)) {
// 					out.push({ path: item.path, sha: item.sha, type: "file" });
// 				}
// 			}
// 		}
// 		return out;
// 	}

// 	async function fetchFileContent(filePath: string): Promise<string> {
// 		const { data } = await octokit.request(
// 			"GET /repos/{owner}/{repo}/contents/{path}",
// 			{
// 				owner,
// 				repo,
// 				path: filePath,
// 				ref: branch,
// 			}
// 		);
// 		const content = Buffer.from((data as any).content, "base64").toString(
// 			"utf8"
// 		);
// 		return content;
// 	}

// 	const files = await listFilesRecursive("");
// 	const splitter = new RecursiveCharacterTextSplitter({
// 		chunkSize: 1200,
// 		chunkOverlap: 150,
// 	});

// 	// Create Chroma collection and upsert parent/child docs
// 	const chromaClient = new ChromaClient({
// 		path: process.env.CHROMA_URL || "http://localhost:8000",
// 	});
// 	let collection = null;
// 	try {
// 		collection = await chromaClient.getCollection({ name: collectionName });
// 	} catch {
// 		collection = await chromaClient.createCollection({ name: collectionName });
// 	}
// 	const vectorStore = new Chroma(
// 		new OpenAIEmbeddings({ model: "text-embedding-3-large" }),
// 		{ collection }
// 	);

// 	const parentDocs: Document[] = [];
// 	const childDocs: Document[] = [];

// 	for (const f of files) {
// 		const content = await fetchFileContent(f.path);
// 		const parentId = `${owner}/${repo}:${f.path}`;
// 		parentDocs.push(
// 			new Document({
// 				pageContent: content,
// 				metadata: { parentId, source: f.path, language: path.extname(f.path) },
// 			})
// 		);

// 		const chunks = await splitter.splitText(content);
// 		let offset = 0;
// 		for (const chunk of chunks) {
// 			const childId = `${parentId}#${offset}`;
// 			childDocs.push(
// 				new Document({
// 					pageContent: chunk,
// 					metadata: { parentId, source: f.path, childId, start: offset },
// 				})
// 			);
// 			offset += chunk.length;
// 		}
// 	}

// 	// Store children as the searchable vectors; parents for reconstruction
// 	if (childDocs.length) {
// 		await vectorStore.addDocuments(childDocs);
// 	}

// 	// Optionally store parent stubs in a separate collection (e.g., `${collectionName}-parents`) if you want retrieval-by-parent.
// 	return { filesIndexed: files.length, childChunks: childDocs.length };
// }

// // File: src/retriever.ts
// // Purpose: ParentDocumentRetriever-style retrieval using child vectors, then grouping by parent and pulling neighbors.

// import { Chroma } from "@langchain/community/vectorstores/chroma";
// import { Document } from "@langchain/core/documents";

// export async function retrieveWithParents(options: {
// 	vectorStore: Chroma;
// 	query: string;
// 	kPerQuery?: number;
// 	maxParents?: number;
// 	neighbors?: number; // number of adjacent children to pull for each hit
// }) {
// 	const { vectorStore, query, kPerQuery = 6, maxParents = 10 } = options;
// 	const hits = await vectorStore.similaritySearch(query, kPerQuery);

// 	// Group by parentId
// 	const byParent = new Map<string, Document[]>();
// 	for (const h of hits) {
// 		const parentId = (h.metadata as any).parentId;
// 		if (!byParent.has(parentId)) byParent.set(parentId, []);
// 		byParent.get(parentId)!.push(h);
// 	}

// 	// Truncate to top parents
// 	const parents = Array.from(byParent.entries()).slice(0, maxParents);

// 	// Pull neighbors by start offsets (assumes children were inserted in order with start metadata)
// 	const expanded: Document[] = [];
// 	for (const [, docs] of parents) {
// 		const sorted = docs.sort(
// 			(a, b) =>
// 				((a.metadata as any).start ?? 0) - ((b.metadata as any).start ?? 0)
// 		);
// 		for (const d of sorted) {
// 			expanded.push(d);
// 		}
// 	}
// 	return expanded;
// }

// // File: src/suggestions.ts
// // Purpose: Utilities to format GitHub suggested changes and create inline review comments.

// export function makeSuggestionBlock(newCode: string): string {
// 	// GitHub suggestion block must be fenced with ```suggestion
// 	return ["```suggestion", newCode.trim(), "```"].join("\n");
// }

// export type InlineSuggestion = {
// 	path: string; // file path in repo
// 	body: string; // markdown body incl. suggestion block(s)
// 	line?: number; // new file line number (for simplified positioning)
// 	side?: "RIGHT" | "LEFT"; // for GraphQL API; REST uses position
// };

// // File: src/queue.ts
// // Purpose: BullMQ queue for async processing of heavy PR reviews.

// import { Queue, Worker } from "bullmq";
// import type { JobsOptions } from "bullmq";
// import IORedis from "ioredis";

// export const connection = new IORedis(
// 	process.env.REDIS_URL || "redis://127.0.0.1:6379"
// );

// export const reviewQueue = new Queue("pr-review", { connection });

// export type ReviewJobData = { owner: string; repo: string; prNumber: number };

// export async function enqueueReview(
// 	data: ReviewJobData,
// 	opts: JobsOptions = {
// 		attempts: 3,
// 		backoff: { type: "exponential", delay: 3000 },
// 	}
// ) {
// 	return reviewQueue.add("review", data, opts);
// }

// // File: src/worker.ts
// // Purpose: BullMQ worker that runs the LangGraph pipeline for queued PRs.

// import { Worker } from "bullmq";
// import { connection } from "./queue";
// import { runGraphForPR } from "./pr_review_pipeline"; // reuse the function exported from main file

// export const worker = new Worker(
// 	"pr-review",
// 	async (job) => {
// 		const { owner, repo, prNumber } = job.data as any;
// 		await runGraphForPR(owner, repo, prNumber);
// 	},
// 	{ connection }
// );

// // File: src/inline_comments.ts
// // Purpose: Post inline review comments to PR files. This requires mapping to the latest commit SHA and positions.

// import { Octokit } from "octokit";

// export async function postInlineComments(
// 	octokit: Octokit,
// 	params: {
// 		owner: string;
// 		repo: string;
// 		prNumber: number;
// 		suggestions: InlineSuggestion[];
// 	}
// ) {
// 	const { owner, repo, prNumber, suggestions } = params;
// 	const { data: pr } = await octokit.request(
// 		"GET /repos/{owner}/{repo}/pulls/{pull_number}",
// 		{ owner, repo, pull_number: prNumber }
// 	);
// 	const commitId = pr.head.sha;

// 	for (const s of suggestions) {
// 		try {
// 			await octokit.request(
// 				"POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
// 				{
// 					owner,
// 					repo,
// 					pull_number: prNumber,
// 					body: s.body,
// 					commit_id: commitId,
// 					path: s.path,
// 					line: s.line ?? 1, // naive; ideally compute exact line in the new file
// 					side: "RIGHT",
// 				} as any
// 			);
// 		} catch (e) {
// 			// Fallback to a general issue comment if inline fails
// 			await octokit.request(
// 				"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
// 				{
// 					owner,
// 					repo,
// 					issue_number: prNumber,
// 					body: `Inline comment failed for ${s.path}. Posting here instead.\n\n${s.body}`,
// 				}
// 			);
// 		}
// 	}
// }

// // File: src/install_webhook.ts
// // Purpose: Minimal endpoint to index a repo when the GitHub App is installed or when a user clicks a setup action.

// import express from "express";
// import { indexRepoToChroma } from "./indexer";

// export const installRouter = express.Router();

// installRouter.post("/install-index", async (req, res) => {
// 	try {
// 		const { owner, repo, branch, collectionName } = req.body || {};
// 		if (!owner || !repo) return res.status(400).send("owner/repo required");
// 		const name = collectionName || `repo-${owner}-${repo}`;
// 		const result = await indexRepoToChroma({
// 			owner,
// 			repo,
// 			branch,
// 			collectionName: name,
// 		});
// 		res.status(200).json({ ok: true, ...result });
// 	} catch (e) {
// 		console.error(e);
// 		res.status(500).json({ ok: false, error: String(e) });
// 	}
// });

// // PATCH: src/pr_review_pipeline.ts updates
// // - Export runGraphForPR for worker
// // - Use ParentDocumentRetriever in retrieveContextNode
// // - Add inline suggestions support and queue handling in webhook

// // [Add near existing imports]
// // import { retrieveWithParents } from "./retriever";
// // import { enqueueReview } from "./queue";
// // import { installRouter } from "./install_webhook";
// // import { makeSuggestionBlock, InlineSuggestion } from "./suggestions";
// // import { postInlineComments } from "./inline_comments";

// // [Modify retrieveContextNode]
// const retrieveContextNode_v2: Node<GraphState> = {
// 	name: "retrieveContext",
// 	run: async (state) => {
// 		const collectionName =
// 			process.env.VECTOR_COLLECTION || `repo-${state.owner}-${state.repo}`;
// 		const vectorStore = await makeVectorStore(collectionName);

// 		// Build targeted queries from diff chunks and filenames
// 		const queries: string[] = [];
// 		const diffChunks = await splitForQueries(state.diff);
// 		queries.push(...diffChunks.slice(0, 6));
// 		for (const f of state.changedFiles) queries.push(`Patterns for ${f}`);

// 		const aggregated: Document[] = [];
// 		for (const q of queries) {
// 			const docs = await retrieveWithParents({
// 				vectorStore,
// 				query: q,
// 				kPerQuery: 5,
// 				maxParents: 8,
// 			});
// 			aggregated.push(...docs);
// 			if (aggregated.length > 60) break;
// 		}

// 		// de-dup by childId
// 		const seen = new Set<string>();
// 		const unique = aggregated
// 			.filter((d) => {
// 				const id =
// 					(d.metadata as any)?.childId ||
// 					`${(d.metadata as any)?.parentId}:${(d.metadata as any)?.start}`;
// 				if (seen.has(id)) return false;
// 				seen.add(id);
// 				return true;
// 			})
// 			.slice(0, 40);

// 		return { ...state, retrievedDocs: unique };
// 	},
// };

// // [Replace node registration]
// // nodes: [parsePRNode, retrieveContextNode_v2, assemblePromptNode, llmNode, publishNode]

// // [Add a simple post-processing step to extract inline suggestions from LLM text]
// function extractInlineSuggestions(review: string): InlineSuggestion[] {
// 	// Convention: LLM returns blocks like: "File: path/to/file.ts (line 42)" followed by a ```suggestion block
// 	const lines = review.split(/\r?\n/);
// 	const out: InlineSuggestion[] = [];
// 	let current: InlineSuggestion | null = null;
// 	let inSuggestion = false;
// 	let buffer: string[] = [];

// 	for (const line of lines) {
// 		const m = line.match(/^File:\s+([^\(]+)\(line\s+(\d+)\)/i);
// 		if (m) {
// 			if (current && buffer.length) {
// 				current.body += "\n" + buffer.join("\n");
// 				out.push(current);
// 			}
// 			current = { path: m[1].trim(), line: Number(m[2]), body: "" };
// 			buffer = [];
// 			inSuggestion = false;
// 			continue;
// 		}
// 		if (/^```suggestion/.test(line)) {
// 			inSuggestion = true;
// 			buffer.push(line);
// 			continue;
// 		}
// 		if (/^```\s*$/.test(line) && inSuggestion) {
// 			buffer.push(line);
// 			inSuggestion = false;
// 			continue;
// 		}
// 		if (inSuggestion) buffer.push(line);
// 	}
// 	if (current && buffer.length) {
// 		current.body += "\n" + buffer.join("\n");
// 		out.push(current);
// 	}
// 	return out;
// }

// // [Modify publishNode to post inline suggestions when available]
// const publishNode_v2: Node<GraphState> = {
// 	name: "publishReview",
// 	run: async (state) => {
// 		const octokit = await getOctokitForRepo(state.owner, state.repo);
// 		const header = `🤖 Repo-aware PR review (experimental)\n\n`;
// 		const body = header + state.review;
// 		await postReviewComment(
// 			octokit,
// 			state.owner,
// 			state.repo,
// 			state.prNumber,
// 			body
// 		);

// 		// Try inline suggestions
// 		const suggestions = extractInlineSuggestions(state.review);
// 		if (suggestions.length) {
// 			await postInlineComments(octokit, {
// 				owner: state.owner,
// 				repo: state.repo,
// 				prNumber: state.prNumber,
// 				suggestions,
// 			});
// 		}
// 		return state;
// 	},
// };

// // [Export runGraphForPR for worker]
// export async function runGraphForPR(
// 	owner: string,
// 	repo: string,
// 	prNumber: number
// ) {
// 	const initial: GraphState = {
// 		owner,
// 		repo,
// 		prNumber,
// 		diff: "",
// 		changedFiles: [],
// 		retrievedDocs: [],
// 		prompt: "",
// 		review: "",
// 	};
// 	const g = createGraph<GraphState>({
// 		nodes: [
// 			parsePRNode,
// 			retrieveContextNode_v2,
// 			assemblePromptNode,
// 			llmNode,
// 			publishNode_v2,
// 		],
// 		edges: [
// 			{ from: "parsePR", to: "retrieveContext" },
// 			{ from: "retrieveContext", to: "assemblePrompt" },
// 			{ from: "assemblePrompt", to: "llmReview" },
// 			{ from: "llmReview", to: "publishReview" },
// 		],
// 	});
// 	await g.run(initial);
// }

// // [Webhook server integration: enqueue jobs and install router]
// // In src/pr_review_pipeline.ts Express server, add:
// app.use("/admin", installRouter);

// app.post("/webhook", async (req, res) => {
// 	try {
// 		if (!verifySignature(req)) return res.status(401).send("Invalid signature");
// 		const payload = PullRequestPayload.safeParse(req.body);
// 		if (!payload.success) return res.status(200).send("Ignored event");
// 		const { action, repository, pull_request } = payload.data;
// 		if (!["opened", "synchronize", "ready_for_review"].includes(action))
// 			return res.status(200).send("Event not handled");

// 		const owner = repository.owner.login;
// 		const repo = repository.name;
// 		const prNumber = pull_request.number;

// 		await enqueueReview({ owner, repo, prNumber });
// 		return res.status(202).send("Queued review");
// 	} catch (err) {
// 		console.error(err);
// 		return res.status(500).send("Server error");
// 	}
// });

// // Boot the worker somewhere in your server startup (or a separate process):
// import "./worker";
