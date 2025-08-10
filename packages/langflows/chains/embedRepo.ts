import { getModelClass } from "../utils/LLMFactory";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";

export async function embedRepoChain(
	installationId: number,
	owner: string,
	repoName: string
) {
	const modelClass = getModelClass();

	const githubURL = `https://github.com/${owner}/${repoName}`;
	const githubLoader = getGithubLoader(githubURL);
	const docs = await githubLoader.load();

	const splitter = getTextSplitter();
	const splitDocs = await splitter.splitDocuments(docs);
	const chroma = await Chroma.fromDocuments(
		splitDocs,
		new OllamaEmbeddings({
			model: "unclemusclez/jina-embeddings-v2-base-code",
			baseUrl: "http://localhost:11434",
		}),
		{
			url: "http://localhost:8000",
		}
	);
	console.log("Docs loaded successfully", splitDocs);
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
