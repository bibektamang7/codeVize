import type { PullRequestGraphState } from "../../graphs/pullRequestGraph";
import { getAuthenticatedOctokit } from "github-config";
import {
	REVIEWED_COMMITS_BLOCK_END,
	REVIEWED_COMMITS_BLOCK_START,
	SUMMARIZE_TAG,
} from "..";
import { checkPathFilter } from "../utils";

export const retrievePRFiles = async (
	State: typeof PullRequestGraphState.State
) => {
	const octokit = await getAuthenticatedOctokit(State.installationId);

	const pr = await octokit.rest.pulls.get({
		owner: State.owner,
		repo: State.repoName,
		pull_number: State.prNumber,
	});

	const targetBranchDiff = await octokit.request(
		"GET /repos/{owner}/{repo}/compare/{base}...{head}",
		{
			owner: State.owner,
			repo: State.repoName,
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
		repo: State.repoName,
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
				repo: State.repoName,
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
				repo: State.repoName,
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

	const configFileContents: Record<string, string> = {};
	if (
		State.repo &&
		State.repo.repoConfig &&
		State.repo.repoConfig.reviewConfig.aiReviewEnabled
	) {
		const configFiles = [
			".eslintrc.json",
			".prettierrc",
			"tsconfig.json",
			"package.json",
		];

		for (const path of configFiles) {
			try {
				const fileResponse = await octokit.rest.repos.getContent({
					owner: State.owner,
					repo: State.repoName,
					path,
					ref: pr.data.head.ref,
				});

				if (
					!Array.isArray(fileResponse.data) &&
					"content" in fileResponse.data
				) {
					const buff = Buffer.from(fileResponse.data.content, "base64");
					configFileContents[path] = buff.toString("utf-8");
				}
			} catch (err) {
				configFileContents[path] = "";
			}
		}
	}

	return {
		...State,
		unReviewedFiles: filterSelectedFiles,
		commits: commits,
		repoConfigFiles: configFileContents,
	};
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
