import { prisma } from "db/prisma";
import { ChromaClient } from "chromadb";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { listRepoFiles, getRepoFileContent } from "./github/index";
import { minimatch } from "minimatch";

const chroma = new ChromaClient();
const embeddings = new GoogleGenerativeAIEmbeddings({
	model: "embedding-001",
	apiKey: process.env.GEMINI_API_KEY,
});

const shouldEmbedFile = (
	filePath: string,
	pathConfigs: { pathPattern: string; enabled: boolean }[]
): boolean => {
	return pathConfigs.some(
		(config) =>
			config.enabled &&
			minimatch(filePath, config.pathPattern.replace(/\*\*/g, "*"))
	);
};

export const ingestRepoIntoChroma = async (
	installationId: number,
	owner: string,
	repo: string,
	repoId: string
) => {
	console.log(`📥 Ingesting ${owner}/${repo} into ChromaDB...`);

	const repoRecord = await prisma.repo.findUnique({
		where: { repoId },
		include: {
			repoConfig: {
				include: {
					reviewConfig: { include: { pathConfigs: true } },
				},
			},
		},
	});

	if (!repoRecord?.repoConfig) {
		console.log("No config. Skipping.");
		return;
	}

	const pathConfigs = repoRecord.repoConfig.reviewConfig.pathConfigs;
	const allFiles = await listRepoFiles(installationId, owner, repo);
	const filesToEmbed: { filePath: string; content: string }[] = [];

	for (const filePath of allFiles) {
		const content = await getRepoFileContent(
			installationId,
			owner,
			repo,
			filePath
		);
		if (!content || content.trim().length < 50) continue;

		if (shouldEmbedFile(filePath, pathConfigs)) {
			filesToEmbed.push({ filePath, content });
		}
	}

	console.log(`Selected ${filesToEmbed.length} files`);

	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1000,
		chunkOverlap: 200,
	});
	const collection = await chroma.getOrCreateCollection({ name: "repo_code" });

	const documents: string[] = [];
	const metadatas: Record<string, any>[] = [];
	const ids: string[] = [];

	for (const { filePath, content } of filesToEmbed) {
		const chunks = await splitter.splitText(content);
		chunks.forEach((chunk, i) => {
			ids.push(`${repoId}_${filePath}_${i}`);
			documents.push(chunk);
			metadatas.push({ repoId, filePath, chunkIndex: i });
		});
	}

	if (documents.length > 0) {
		try {
			await collection.delete({ where: { repoId } });
		} catch (e) {
			/* ignore */
		}

		const vectors = await embeddings.embedDocuments(documents);
		await collection.add({ ids, embeddings: vectors, metadatas, documents });
		console.log(`✅ Embedded ${documents.length} chunks`);
	}
};
