import { prisma } from "db/prisma";

export const deleteEmbedRepo = async ({
	installationId,
	repoId,
	repoName,
	owner,
}: {
	installationId: number;
	repoId: string;
	repoName: string;
	owner: string;
}) => {
	console.log(`Cleaning up resources for ${owner}/${repoName}...`);
	try {
		try {
			await prisma.repo.delete({
				where: { repoId, installationId: String(installationId) },
			});
			console.log(" Repo record removed from DB");
		} catch (err: any) {
			if (err.code === "P2025") {
				console.log("️Repo not found in DB, skipping");
			} else {
				console.error("Error deleting repo from DB:", err);
			}
		}

		console.log(`Cleanup completed for ${owner}/${repoName}`);
	} catch (error) {
		console.error(`Cleanup failed for ${owner}/${repoName}:`, error);
	}
};

// import { Chroma } from "@langchain/community/vectorstores/chroma";
// import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { listRepoFiles, getRepoFileContent } from "../utils/github/index";
// import { buildDependencyGraph } from "../utils/github/astParser";
// import { prisma } from "db/prisma";
// import {
// 	embeddingModelName,
// 	embeddingModelUrl,
// 	vectorDBHost,
// 	vectorDBPort,
// 	vectorDBSSL,
// } from "../utils/config";

// export const embedRepoChain = async (
// 	installationId: number,
// 	owner: string,
// 	repo: string
// ) => {
// 	console.log(`Embedding repo: ${owner}/${repo}`);

// 	const allFiles = await listRepoFiles(installationId, owner, repo);
// 	const filteredFiles = allFiles.filter(shouldEmbed);

// 	const fileContents: Record<string, string> = {};

// 	for (const file of filteredFiles) {
// 		const content = await getRepoFileContent(installationId, owner, repo, file);
// 		if (content && content.length < 100_000) fileContents[file] = content;
// 	}

// 	const graph = buildDependencyGraph(fileContents);

// 	const splitter = new RecursiveCharacterTextSplitter({
// 		chunkSize: 1000,
// 		chunkOverlap: 150,
// 	});

// 	const embeddingModel = new OllamaEmbeddings({
// 		model: process.env.EMBEDDING_MODEL || "mxbai-embed-large",
// 		baseUrl: process.env.EMBEDDING_MODEL_URL || "http://localhost:11434",
// 	});

// 	const chromaStore = new Chroma(embeddingModel, {
// 		collectionName: "repo_embeddings",
// 		collectionMetadata: { repoId: `${owner}/${repo}`, installationId },
// 		clientParams: { host: "localhost", port: 8000 },
// 	});

// 	const docs = [];
// 	for (const [path, code] of Object.entries(fileContents)) {
// 		const chunks = await splitter.splitText(code);
// 		for (const chunk of chunks) {
// 			docs.push({
// 				pageContent: chunk,
// 				metadata: {
// 					filePath: path,
// 					repo,
// 					owner,
// 					imports: graph[path],
// 				},
// 			});
// 		}
// 	}

// 	await chromaStore.addDocuments(docs);
// 	console.log("✅ Repo embedded successfully");
// };

// const shouldEmbed = (filePath: string) => {
// 	const skipPatterns = [
// 		"node_modules/",
// 		"dist/",
// 		"build/",
// 		".next/",
// 		"__tests__/",
// 		"coverage/",
// 		"scripts/",
// 		"docs/",
// 		"examples/",
// 		"assets/",
// 		"public/",
// 	];
// 	const skipExtensions = [
// 		".json",
// 		".md",
// 		".yml",
// 		".yaml",
// 		".svg",
// 		".png",
// 		".jpg",
// 		".jpeg",
// 		".lock",
// 	];
// 	const fileName = filePath.split("/").pop() || "";
// 	if (skipPatterns.some((p) => filePath.includes(p))) return false;
// 	if (skipExtensions.some((ext) => fileName.endsWith(ext))) return false;
// 	if (fileName.startsWith(".") || fileName.startsWith("index.")) return false;
// 	if (fileName.includes(".test.") || fileName.includes(".spec.")) return false;
// 	return fileName.endsWith(".ts") || fileName.endsWith(".tsx");
// };
