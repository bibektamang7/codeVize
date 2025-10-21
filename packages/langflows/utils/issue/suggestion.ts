import { getCodeSuggestionModel } from "../codeSuggestionLLMFactory";
import { getAuthenticatedOctokit } from "github-config";
import { logger } from "logger";
import type { IssueGraphState } from "../../graphs/issueGraph";
import { tryInvoke } from "../utils";
import { ALLOWED_LABELS, MAX_LABELS } from "../config";
import { SYSTEM_PROMPT } from "../config";

export const labelsSuggesion = async (state: typeof IssueGraphState.State) => {
	try {
		const { title, body, owner, repoName, issueNumber, installationId } = state;
		const model = getCodeSuggestionModel();

		const userPrompt = `
Issue triage request for ${owner}/${repoName}#${issueNumber}

Title:
${title}

Body:
${body || "(no body provided)"}

Task:
Return a JSON object with a single key "labels" whose value is an array of labels from the allowed set.
Follow the system instructions exactly.
`;

		const res = await tryInvoke(
			() =>
				model.invoke([
					{ role: "system", content: SYSTEM_PROMPT },
					{ role: "user", content: userPrompt },
				]),
			2,
			800
		);

		const raw = (res.text ?? res?.content ?? "").trim();

		let jsonString = raw;
		const firstBrace = raw.indexOf("{");
		const lastBrace = raw.lastIndexOf("}");
		if (firstBrace !== -1 && lastBrace !== -1) {
			jsonString = raw.slice(firstBrace, lastBrace + 1);
		}

		let parsed: any = null;
		try {
			parsed = JSON.parse(jsonString);
		} catch (err: any) {
			logger.warn(
				"labelsSuggestion: failed to parse JSON from model output, falling back to 'triage'",
				{
					raw,
					error: err?.message ?? err,
				}
			);
		}

		let labels: string[] = [];
		if (parsed && Array.isArray(parsed.labels)) {
			const seen = new Set<string>();
			for (const label of parsed.labels) {
				if (!label || typeof label !== "string") continue;
				const norm = label.toLowerCase().trim();
				if (ALLOWED_LABELS.has(norm) && !seen.has(norm)) {
					labels.push(norm);
					seen.add(norm);
					if (labels.length >= MAX_LABELS) break;
				}
			}
		}

		if (labels.length === 0) {
			labels = ["triage"];
		}

		const octokit = await getAuthenticatedOctokit(installationId);
		try {
			await octokit.rest.issues.addLabels({
				owner,
				repo: repoName,
				issue_number: issueNumber,
				labels,
			});
			logger.info("labelsSuggestion: added labels", {
				owner,
				repoName,
				issueNumber,
				labels,
			});
		} catch (err) {
			logger.error("labelsSuggestion: failed to add labels to GitHub", err);
			// do not crash pipeline, continue
		}

		return state;
	} catch (error) {
		logger.error("labelsSuggestion: unexpected error", error);
		return state;
	}
};
