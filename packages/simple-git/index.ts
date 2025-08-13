import { simpleGit } from "simple-git";

const DEFAULT_INCLUDE = ["**/*.{ts,tsx,js,jsx,py,go,java,md,json,yml,yaml}"];
const DEFAULT_EXCLUDE = [
	"**/node_modules/**",
	"**/dist/**",
	"**/build/**",
	"**/.git/**",
];

const EXT_LANG: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript React",
  ".js": "JavaScript",
  ".jsx": "JavaScript React",
  ".py": "Python",
  ".go": "Go",
  ".java": "Java",
  ".cs": "C#",
  ".md": "Markdown",
  ".json": "JSON",
  ".yml": "YAML",
  ".yaml": "YAML",
};
const resp = simpleGit();



// import simpleGit from "simple-git";
import { writeFileSync } from "fs";

const git = simpleGit();

interface DiffLine {
	type: "add" | "del" | "context" | "hunk" | "file" | "meta";
	content: string;
}

interface DiffHunk {
	header: string;
	lines: DiffLine[];
}

interface DiffFile {
	oldFile: string;
	newFile: string;
	hunks: DiffHunk[];
	meta: string[];
}

function parseDiff(rawDiff: string): DiffFile[] {
	const files: DiffFile[] = [];
	const diffBlocks = rawDiff.split(/^diff --git /gm).filter(Boolean);

	for (const block of diffBlocks) {
		const lines = block.split("\n");

		// First line contains old and new file paths
		const fileLine = lines.shift()!;
		const fileMatch = fileLine.match(/^a\/(.+?) b\/(.+)$/);
		const oldFile = (fileMatch ? fileMatch[1] : "") ?? "";
		const newFile = (fileMatch ? fileMatch[2] : "") ?? "";

		const file: DiffFile = {
			oldFile,
			newFile,
			hunks: [],
			meta: [],
		};

		let currentHunk: DiffHunk | null = null;

		for (const line of lines) {
			if (
				line.startsWith("index ") ||
				line.startsWith("new file mode") ||
				line.startsWith("deleted file mode") ||
				line.startsWith("similarity index") ||
				line.startsWith("rename from") ||
				line.startsWith("rename to")
			) {
				file.meta.push(line);
			} else if (line.startsWith("@@")) {
				// Start a new hunk
				if (currentHunk) {
					file.hunks.push(currentHunk);
				}
				currentHunk = { header: line, lines: [] };
			} else if (currentHunk) {
				let type: DiffLine["type"] = "context";
				if (line.startsWith("+")) type = "add";
				else if (line.startsWith("-")) type = "del";
				else if (line.startsWith(" ")) type = "context";
				currentHunk.lines.push({ type, content: line });
			} else {
				// lines outside hunks - treat as meta
				file.meta.push(line);
			}
		}
		if (currentHunk) {
			file.hunks.push(currentHunk);
		}
		files.push(file);
	}
	return files;
}

function formatDiffFileToMarkdown(file: DiffFile): string {
	let md = `## \`${file.oldFile}\` → \`${file.newFile}\`\n\n`;

	if (file.meta.length) {
		md += file.meta.map((l) => `> ${l}`).join("\n") + "\n\n";
	}

	for (const hunk of file.hunks) {
		md += `\`\`\`diff\n${hunk.header}\n`;
		for (const line of hunk.lines) {
			if (line.type === "add") {
				md += `+${line.content.slice(1)}\n`;
			} else if (line.type === "del") {
				md += `-${line.content.slice(1)}\n`;
			} else {
				md += ` ${line.content.slice(1)}\n`;
			}
		}
		md += "```\n\n";
	}

	return md;
}

export async function saveAdvancedDiffMarkdownFiltered() {

	try {
		const rawDiff = await git.diff(["HEAD~1", "HEAD"]);
		const parsed = parseDiff(rawDiff);

		const excludedFiles = [
			"package.json",
			"tsconfig.json",
			"package-lock.json",
			"yarn.lock",
			"bun.lock",
			"turbo.json",
		];
		const filteredFiles = parsed.filter(
			(file) =>
				!excludedFiles.some(
					(exclude) =>
						file.oldFile.endsWith(exclude) || file.newFile.endsWith(exclude)
				)
		);

		let mdOutput = `# Advanced Git Diff Report (Filtered)\n\n`;
		for (const file of filteredFiles) {
			mdOutput += formatDiffFileToMarkdown(file);
		}

		writeFileSync("advanced-diff-filtered.md", mdOutput);
		return mdOutput

		console.log("✅ Filtered Git diff saved to advanced-diff-filtered.md");
	} catch (err) {
		console.error("❌ Failed to get or save filtered diff:", err);
	}
}
