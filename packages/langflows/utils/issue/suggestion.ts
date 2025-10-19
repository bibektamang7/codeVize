import { getAuthenticatedOctokit } from "github-config";
import type { IssueGraphState } from "../../graphs/issueGraph";

export const labelsSuggesion = async (state: typeof IssueGraphState.State) => {
	try {
		const { title, body, owner, repoName, issueNumber, installationId } = state;
		const model = getLLM("gpt-4o-mini");

		const prompt = `
You are an issue triage assistant. Based on the following GitHub issue,
suggest the most relevant label from: [bug, feature, security, documentation, enhancement, question].

Title: ${title}
Body: ${body}

Return only a JSON object like:
{ "labels": ["bug", "priority:high"] }
`;

		const res = await model.invoke([{ role: "user", content: prompt }]);
		let labels: string[] = [];

		try {
			const parsed = JSON.parse(res.text);
			labels = parsed.labels;
		} catch {
			labels = ["triage"];
		}

		const octokit = await getAuthenticatedOctokit(installationId);
		await octokit.rest.issues.addLabels({
			owner,
			repo: repoName,
			issue_number: issueNumber,
			labels,
		});

		console.log(
			`🏷️ Added labels to issue #${issueNumber}: ${labels.join(", ")}`
		);
		return state;
	} catch (error) {}
};
