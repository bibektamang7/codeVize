"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { BadgeAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import React from "react";
import { redirect, useParams, useRouter } from "next/navigation";

type PlanType = "FREE" | "PRO" | "ENTERPRISE" | null;

interface BaseSetting {
	id: string;
	label: string;
	type: "switch" | "input" | "select";
	tooltip: string;
	planRequired: PlanType;
}

interface SwitchSetting extends BaseSetting {
	type: "switch";
}

interface InputSetting extends BaseSetting {
	type: "input";
	inputType?: string;
	defaultValue?: string;
}

interface SelectOption {
	value: string;
	label: string;
}

interface SelectSetting extends BaseSetting {
	type: "select";
	selectOptions: SelectOption[];
	defaultValue?: string;
}

type Setting = SwitchSetting | InputSetting | SelectSetting;
interface SettingsSection {
	[key: string]: Setting[];
}
interface SettingsValues {
	[key: string]: string | boolean;
}

const settingsConfig: SettingsSection = {
	general: [
		{
			id: "tone-instructions",
			label: "Tone Instructions",
			type: "input",
			tooltip: "Custom instructions for AI tone",
			planRequired: null,
		},
		{
			id: "early-access",
			label: "Early Access",
			type: "switch",
			tooltip: "Enable access to beta features",
			planRequired: "PRO",
		},
		{
			id: "enable-free-tier",
			label: "Enable Free Tier",
			type: "switch",
			tooltip: "Allow free tier usage for this repository",
			planRequired: "PRO",
		},
	],
	review: [
		{
			id: "ai-review-enabled",
			label: "AI Review Enabled",
			type: "switch",
			tooltip: "Enable AI code review for this repository",
			planRequired: "PRO",
		},
		{
			id: "abort-on-close",
			label: "Abort on close",
			type: "switch",
			tooltip: "Abort the review process when closing",
			planRequired: "PRO",
		},
		{
			id: "progress-fortune",
			label: "Progress Fortune",
			type: "switch",
			tooltip: "Enable AI progress fortune for this repository",
			planRequired: "PRO",
		},
		{
			id: "poem-on-review",
			label: "Poem on review",
			type: "switch",
			tooltip: "Enable AI poem for this repository",
			planRequired: "PRO",
		},
		{
			id: "high-level-summary",
			label: "High Level Summary",
			type: "switch",
			tooltip: "Show high level summaries in reviews",
			planRequired: "PRO",
		},
		{
			id: "show-walkthrough",
			label: "Show Walkthrough",
			type: "switch",
			tooltip: "Show walkthrough of the changes in reviews",
			planRequired: "PRO",
		},
	],
	"knowledge-base": [
		{
			id: "embedding-enabled",
			label: "Embedding Enabled",
			type: "switch",
			tooltip: "Enable embedding of repository context",
			planRequired: "ENTERPRISE",
		},
		{
			id: "max-embeddings",
			label: "Max Embeddings",
			type: "input",
			inputType: "number",
			defaultValue: "1000",
			tooltip: "Maximum number of embeddings per repository",
			planRequired: "ENTERPRISE",
		},
	],
	"code-generation": [
		{
			id: "model-selection",
			label: "Model Selection",
			type: "select",
			tooltip: "Choose the AI model for code generation",
			planRequired: "PRO",
			selectOptions: [
				{ value: "gpt-4", label: "GPT-4" },
				{ value: "claude-3", label: "Claude 3" },
				{ value: "llama-3", label: "Llama 3" },
			],
		},
		{
			id: "generation-max-tokens",
			label: "Max Tokens",
			type: "input",
			inputType: "number",
			defaultValue: "4096",
			tooltip: "Maximum tokens for code generation",
			planRequired: "ENTERPRISE",
		},
	],
};

const SettingsCard: React.FC<{
	title: string;
	settings: Setting[];
	stateValues: SettingsValues;
	setStateValues: React.Dispatch<React.SetStateAction<SettingsValues>>;
	isProOrEnterprise: boolean;
	isEnterprise: boolean;
}> = ({
	title,
	settings,
	stateValues,
	setStateValues,
	isProOrEnterprise,
	isEnterprise,
}) => {
	const updateState = (id: string, value: string | boolean) => {
		setStateValues((prev) => ({ ...prev, [id]: value }));
	};

	const renderSettingField = (setting: Setting) => {
		const { id, type } = setting;
		const isDisabled =
			(setting.planRequired === "PRO" && !isProOrEnterprise) ||
			(setting.planRequired === "ENTERPRISE" && !isEnterprise);

		switch (type) {
			case "switch":
				return (
					<Switch
						id={id}
						checked={!isDisabled && (stateValues[id] as boolean)}
						onCheckedChange={(value) => updateState(id, value)}
						disabled={isDisabled}
					/>
				);
			case "input":
				return (
					<Input
						id={id}
						type={(setting as InputSetting).inputType || "text"}
						value={(stateValues[id] as string) || ""}
						onChange={(e) => updateState(id, e.target.value)}
						disabled={isDisabled}
						className="w-full sm:w-[300px] bg-gray-900 border-gray-700"
					/>
				);
			case "select":
				return (
					<Select
						value={(stateValues[id] as string) || ""}
						onValueChange={(value) => updateState(id, value)}
						disabled={isDisabled}
					>
						<SelectTrigger className="w-full sm:w-[180px] bg-gray-900 border-gray-700">
							<SelectValue placeholder="Select option" />
						</SelectTrigger>
						<SelectContent className="bg-gray-900 border-gray-700">
							{(setting as SelectSetting).selectOptions?.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			default:
				return null;
		}
	};

	return (
		<Card className="bg-black border-gray-800">
			<CardHeader>
				<CardTitle className="text-xl">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{settings.map((setting) => {
					const isDisabled =
						(setting.planRequired === "PRO" && !isProOrEnterprise) ||
						(setting.planRequired === "ENTERPRISE" && !isEnterprise);

					return (
						<div
							key={setting.id}
							className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
						>
							<div className="flex items-center gap-2">
								<Label
									htmlFor={setting.id}
									className="text-base"
								>
									{setting.label}
								</Label>
								<Tooltip>
									<TooltipTrigger asChild>
										<BadgeAlert
											size={14}
											className={isDisabled ? "text-gray-600" : "text-gray-400"}
										/>
									</TooltipTrigger>
									<TooltipContent>
										<span className="text-xs text-gray-400">
											{setting.tooltip}
										</span>
									</TooltipContent>
								</Tooltip>
							</div>
							{renderSettingField(setting)}
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
};

const RepoSettingsPage = ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = React.use<{ id: string }>(params);

	const { data: session } = useSession();
	const plan = session?.user?.plan as PlanType;
	const isProOrEnterprise = plan === "PRO" || plan === "ENTERPRISE";
	const isEnterprise = plan === "ENTERPRISE";

	const [settingsValues, setSettingsValues] = useState<SettingsValues>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRepoSettings = async () => {
			try {
				const res = await axios.get(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/repositories/repository/${id}`,
					{
						headers: {
							Authorization: `Bearer ${session?.user?.token}`,
						},
					}
				);
				const { repo } = res.data;

				console.log("this is repo setting", repo);
				const merged: SettingsValues = {
					"tone-instructions": repo.generalConfig?.tone || "",
					"early-access": repo.generalConfig?.earlyAccess || false,
					"enable-free-tier": repo.generalConfig?.enableFreeTier || true,
					"ai-review-enabled": repo.reviewConfig?.aiReviewEnabled || false,
					"abort-on-close": repo.reviewConfig?.abortOnClose || false,
					"progress-fortune":
						repo.reviewConfig?.isProgressFortuneEnabled || false,
					"poem-on-review": repo.reviewConfig?.poemEnabled || false,
					"high-level-summary":
						repo.reviewConfig?.highLevelSummaryEnabled || false,
					"show-walkthrough": repo.reviewConfig?.showWalkThrough || false,
					"embedding-enabled": repo.issueConfig?.issueEmbedEnabled || false,
					"max-embeddings":
						repo.plan?.maxRepoIssueEmbedding?.toString() || "1000",
					"model-selection": repo.generalConfig?.defaultModel || "gpt-4",
					"generation-max-tokens": "4096",
				};

				Object.keys(merged).forEach((key) => {
					const configSection = Object.values(settingsConfig).flat();
					const matched = configSection.find((s) => s.id === key);
					if (matched) {
						if (
							(matched.planRequired === "PRO" && !isProOrEnterprise) ||
							(matched.planRequired === "ENTERPRISE" && !isEnterprise)
						) {
							merged[key] = typeof merged[key] === "boolean" ? false : "";
						}
					}
				});

				setSettingsValues(merged);
			} catch (err) {
				console.error("Failed to fetch settings", err);
			} finally {
				setLoading(false);
			}
		};

		fetchRepoSettings();
	}, [id, isProOrEnterprise, isEnterprise]);

	const handleApplyChanges = async () => {
		console.log("Applying changes:", settingsValues);
		await axios.patch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/repositories/repository/${id}`,
			{
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(settingsValues),
			}
		);
		alert("Changes applied successfully!");
	};

	if (loading)
		return (
			<div className="p-6 text-gray-400">Loading repository settings...</div>
		);

	return (
		<div className="flex-1 p-6">
			<div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
				<h1 className="text-2xl font-bold">{id}</h1>
				<Button
					onClick={handleApplyChanges}
					className="bg-primary hover:bg-orange-600 w-full sm:w-auto"
				>
					Apply Changes
				</Button>
			</div>

			<Tabs
				defaultValue="general"
				className="w-full"
			>
				<TabsList className="bg-gray-900 mb-4 flex-wrap">
					<TabsTrigger value="general">General</TabsTrigger>
					<TabsTrigger value="review">Review</TabsTrigger>
					<TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
					<TabsTrigger value="code-generation">Code Generation</TabsTrigger>
				</TabsList>

				{Object.entries(settingsConfig).map(([sectionKey, sectionSettings]) => (
					<TabsContent
						key={sectionKey}
						value={sectionKey}
						className="space-y-6"
					>
						<SettingsCard
							title={`${sectionKey.replace("-", " ")} Settings`}
							settings={sectionSettings}
							stateValues={settingsValues}
							setStateValues={setSettingsValues}
							isProOrEnterprise={isProOrEnterprise}
							isEnterprise={isEnterprise}
						/>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
};

export default RepoSettingsPage;
