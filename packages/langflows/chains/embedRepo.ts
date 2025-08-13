// import { getModelClass } from "../utils/LLMFactory";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";

export async function deleteEmbededRepo(
	installationId: number,
	owner: string,
	repoName: string
) {
	const embeddingModelName =
		process.env.EMBEDDING_MODEL || "unclemusclez/jina-embeddings-v2-base-code";
	const embeddingModelUrl =
		process.env.EMBEDDING_MODEL_URL || "http://localhost:11434";

	// const vectorDBUrl = process.env.VECTOR_DB_URL || "http://localhost:8000";
	const vectorDBHost = process.env.VECTOR_DB_HOST || "localhost";
	const vectorDBPort = process.env.VECTOR_DB_PORT || 8000;
	const vectorDBSSL =
		process.env.VECTOR_DB_SSL || vectorDBHost === "localhost" ? false : true;
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
	await chromaStore.delete({
		filter: {
			repoId: `${owner}/${repoName}`,
			installationId: installationId,
		},
	});
	console.log("Delete repo embedding too");
}

export async function embedRepoChain(
	installationId: number,
	owner: string,
	repoName: string
) {
	// const modelClass = getModelClass();

	const githubURL = `https://github.com/${owner}/${repoName}`;
	const githubLoader = getGithubLoader(githubURL);
	const docs = await githubLoader.load();

	const splitter = getTextSplitter();
	const splitDocs = await splitter.splitDocuments(docs);
	const embeddingModelName =
		process.env.EMBEDDING_MODEL || "unclemusclez/jina-embeddings-v2-base-code";
	const embeddingModelUrl =
		process.env.EMBEDDING_MODEL_URL || "http://localhost:11434";

	// const vectorDBUrl = process.env.VECTOR_DB_URL || "http://localhost:8000";
	const vectorDBHost = process.env.VECTOR_DB_HOST || "localhost";
	const vectorDBPort = process.env.VECTOR_DB_PORT || 8000;
	const vectorDBSSL =
		process.env.VECTOR_DB_SSL || vectorDBHost === "localhost" ? false : true;
	const embeddingModel = new OllamaEmbeddings({
		model: embeddingModelName,
		baseUrl: embeddingModelUrl,
	});
	const chromaStore = new Chroma(embeddingModel, {
		collectionName: "repo_embeddings",
		collectionMetadata: {
			installationId: installationId,
			repoId: `${owner}/${repoName}`,
		},
		clientParams: {
			host: vectorDBHost,
			port: vectorDBPort,
			ssl: vectorDBSSL,
		},
	});
	await chromaStore.addDocuments(splitDocs);
	console.log("Repo embedded successfully");
}

const getTextSplitter = () => {
	return new RecursiveCharacterTextSplitter({
		chunkOverlap: 200,
		chunkSize: 1000,
		separators: [
			"\nclass",
			"\nfunction",
			"\nconst",
			"\nlet",
			"\nvar",
			"\nif",
			"\nelse",
			"\nfor",
			"\nwhile",
			"\nreturn",
			"\nimport",
			"\nexport",
			"\nfrom",
			"\nrequire",
			"\n//",
			"\n",
		],
	});
};

const getGithubLoader = (githubURL: string) => {
	return new GithubRepoLoader(githubURL, {
		branch: "main",
		recursive: true,
		unknown: "warn",
		ignoreFiles: [
			"README.md",
			"LICENSE",
			"CONTRIBUTING.md",
			"CODE_OF_CONDUCT.md",
			"CHANGELOG.md",
			".gitignore",
			".github",
			".vscode",
			"node_modules",
			"dist",
			"build",
			"*.log",
			"*.lock",
			"*.json",
			"*.yml",
			"*.yaml",
			"*.md",
		],
		ignorePaths: [
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
			"**/coverage/**",
			"**/tests/**",
			"**/.github/**",
			"**/docs/**",
			"**/examples/**",
			"**/scripts/**",
			"**/assets/**",
			"**/public/**",
		],
	});
};
