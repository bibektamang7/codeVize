import RepoSettings from "@/pages/RepoSetting";
import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import axios from "axios";

interface RepoSettingsPageProps {
	params: Promise<{ id: string }>;
}

export default async function RepoSettingsPage({
	params,
}: RepoSettingsPageProps) {
	const { id } = await params;
	const session = await auth();

	if (!session || !session.user) {
		return redirect("/login");
	}

	const plan = session.user.plan;

	const response = await axios.get(
		`${process.env.BACKEND_URL}/repositories/repository/${id}`,
		{
			headers: {
				Authorization: `Bearer ${session.user.token}`,
			},
		}
	);

	const { repo } = response.data;

	console.log("response", repo);
	if (!repo) {
		return <div>Repo not found</div>;
	}
	console.log(
		"thisis enabled issue",
		repo.repoConfig?.issueConfig?.issueEnabled
	);

	const backendSettings = {
		tone: repo.repoConfig?.generalConfig?.tone,
		earlyAccess: repo.repoConfig?.generalConfig?.earlyAccess,
		enableFreeTier: repo.repoConfig?.generalConfig?.enableFreeTier,
		defaultModel: repo.repoConfig?.generalConfig?.defaultModel || "gpt-4",
		contextDepth:
			repo.repoConfig?.generalConfig?.contextDepth?.toString() || "0",
		aiReviewEnabled: repo.repoConfig?.reviewConfig?.aiReviewEnabled,
		abortOnClose: repo.repoConfig?.reviewConfig?.abortOnClose,
		isProgressFortuneEnabled:
			repo.repoConfig?.reviewConfig?.isProgressFortuneEnabled,
		poemEnabled: repo.repoConfig?.reviewConfig?.poemEnabled,
		highLevelSummaryEnabled:
			repo.repoConfig?.reviewConfig?.highLevelSummaryEnabled,
		showWalkThrough: repo.repoConfig?.reviewConfig?.showWalkThrough,
		issueEnabled: repo.repoConfig?.issueConfig?.issueEnabled,
		aiIssueTriageEnabled: repo.repoConfig?.issueConfig?.aiIssueTriageEnabled,
		issueEmbedEnabled: repo.repoConfig?.issueConfig?.issueEmbedEnabled,
		"embedding-enabled": false, // Placeholder value since it doesn't directly map to a schema field
		"max-embeddings": "1000",
		"model-selection": "gpt-4",
		"generation-max-tokens": "4096",
	};

	return (
		<RepoSettings
			repoName={repo.repoName}
			token={session.user.token}
			repoId={id}
			repoConfigId={repo.repoConfig.id}
			plan={plan as any}
			backendSettings={backendSettings}
		/>
	);
}
