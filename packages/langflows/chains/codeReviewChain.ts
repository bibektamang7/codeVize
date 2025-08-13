import { getModelClass } from "../utils/LLMFactory";
import { getAuthenticatedOctokit } from "github-config";

export async function prCodeReviewChain(
	prId: number,
	installationId: number,
	owner: string,
	repo: string
) {
	// const model = getModelClass();
	console.log("yeat same achia aaia here")

	const octokit = await getAuthenticatedOctokit(installationId);
	const pr = await octokit.rest.pulls.get({
		owner,
		repo,
		pull_number: prId,
	});
	console.log("this is pr", pr.data);
}

// async function checking() {
// 	const res = await model.invoke([
// 		{
// 			content: "const hell = [1,2,3,47,23,4] how to sort the array",
// 			role: "user",
// 		},
// 	]);
// 	console.log(res);
// }

// checking();

// const state: State = {
// 	systemMessage: "",
// 	title: "no title provided",
// 	description: "no description provided",
// 	rawSummary: "",
// 	shortSummary: "",
// 	filename: "",
// 	fileContent: "file contents cannot be provided",
// 	fileDiff: "file diff cannot be provided",
// 	patches: "",
// 	diff: "no diff",
// 	commentChain: "no other comments on this patch",
// 	comment: "no comment provided",
// };
