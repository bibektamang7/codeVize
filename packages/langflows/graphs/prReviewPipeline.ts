import type { Node,  } from "@langchain/community/graphs/document";
import type {GraphState}

const retrieveContextNode_v2: Node<GraphState> = {
  name: "retrieveContext",
  run: async (state) => {
    const collectionName = process.env.VECTOR_COLLECTION || `repo-${state.owner}-${state.repo}`;
    const vectorStore = await makeVectorStore(collectionName);

    // Build targeted queries from diff chunks and filenames
    const queries: string[] = [];
    const diffChunks = await splitForQueries(state.diff);
    queries.push(...diffChunks.slice(0, 6));
    for (const f of state.changedFiles) queries.push(`Patterns for ${f}`);

    const aggregated: Document[] = [];
    for (const q of queries) {
      const docs = await retrieveWithParents({ vectorStore, query: q, kPerQuery: 5, maxParents: 8 });
      aggregated.push(...docs);
      if (aggregated.length > 60) break;
    }

    // de-dup by childId
    const seen = new Set<string>();
    const unique = aggregated.filter(d => {
      const id = (d.metadata as any)?.childId || `${(d.metadata as any)?.parentId}:${(d.metadata as any)?.start}`;
      if (seen.has(id)) return false; seen.add(id); return true;
    }).slice(0, 40);

    return { ...state, retrievedDocs: unique };
  },
};

// [Replace node registration]
// nodes: [parsePRNode, retrieveContextNode_v2, assemblePromptNode, llmNode, publishNode]

// [Add a simple post-processing step to extract inline suggestions from LLM text]
function extractInlineSuggestions(review: string): InlineSuggestion[] {
  // Convention: LLM returns blocks like: "File: path/to/file.ts (line 42)" followed by a ```suggestion block
  const lines = review.split(/\r?\n/);
  const out: InlineSuggestion[] = [];
  let current: InlineSuggestion | null = null;
  let inSuggestion = false;
  let buffer: string[] = [];

  for (const line of lines) {
    const m = line.match(/^File:\s+([^\(]+)\(line\s+(\d+)\)/i);
    if (m) {
      if (current && buffer.length) {
        current.body += "\n" + buffer.join("\n");
        out.push(current);
      }
      current = { path: m[1].trim(), line: Number(m[2]), body: "" };
      buffer = [];
      inSuggestion = false;
      continue;
    }
    if (/^```suggestion/.test(line)) { inSuggestion = true; buffer.push(line); continue; }
    if (/^```\s*$/.test(line) && inSuggestion) { buffer.push(line); inSuggestion = false; continue; }
    if (inSuggestion) buffer.push(line);
  }
  if (current && buffer.length) { current.body += "\n" + buffer.join("\n"); out.push(current); }
  return out;
}

// [Modify publishNode to post inline suggestions when available]
const publishNode_v2: Node<GraphState> = {
  name: "publishReview",
  run: async (state) => {
    const octokit = await getOctokitForRepo(state.owner, state.repo);
    const header = `🤖 Repo-aware PR review (experimental)\n\n`;
    const body = header + state.review;
    await postReviewComment(octokit, state.owner, state.repo, state.prNumber, body);

    // Try inline suggestions
    const suggestions = extractInlineSuggestions(state.review);
    if (suggestions.length) {
      await postInlineComments(octokit, { owner: state.owner, repo: state.repo, prNumber: state.prNumber, suggestions });
    }
    return state;
  },
};

// [Export runGraphForPR for worker]
export async function runGraphForPR(owner: string, repo: string, prNumber: number) {
  const initial: GraphState = { owner, repo, prNumber, diff: "", changedFiles: [], retrievedDocs: [], prompt: "", review: "" };
  const g = createGraph<GraphState>({
    nodes: [parsePRNode, retrieveContextNode_v2, assemblePromptNode, llmNode, publishNode_v2],
    edges: [
      { from: "parsePR", to: "retrieveContext" },
      { from: "retrieveContext", to: "assemblePrompt" },
      { from: "assemblePrompt", to: "llmReview" },
      { from: "llmReview", to: "publishReview" },
    ],
  });
  await g.run(initial);
}