"use client";
import { useState } from "react";
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
import axios from "axios";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import LoaderComponent from "@/components/Loader";

interface RepoSettingsClientProps {
	repoName: string;
	repoId: string;
	plan: "FREE" | "PRO" | "ENTERPRISE";
	backendSettings: Record<string, string | boolean>;
	token: string;
	repoConfigId: string;
}

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
			id: "tone",
			label: "Tone Instructions",
			type: "select",
			tooltip: "Custom instructions for AI tone",
			planRequired: null,
			selectOptions: [
				{ value: "professional", label: "Professional" },
				{ value: "casual", label: "Casual" },
				{ value: "friendly", label: "Friendly" },
				{ value: "humorous", label: "Humorous" },
				{ value: "enthusiastic", label: "Enthusiastic" },
				{ value: "empathetic", label: "Empathetic" },
				{ value: "formal", label: "Formal" },
				{ value: "informal", label: "Informal" },
			],
		},
		{
			id: "earlyAccess",
			label: "Early Access",
			type: "switch",
			tooltip: "Enable access to beta features",
			planRequired: "PRO",
		},
		{
			id: "enableFreeTier",
			label: "Enable Free Tier",
			type: "switch",
			tooltip: "Allow free tier usage for this repository",
			planRequired: "PRO",
		},
		{
			id: "defaultModel",
			label: "Default Model",
			type: "input",
			tooltip: "Default AI model for this repository",
			planRequired: "PRO",
		},
		{
			id: "contextDepth",
			label: "Context Depth",
			type: "input",
			inputType: "number",
			tooltip: "Context depth for AI processing",
			planRequired: "ENTERPRISE",
		},
	],
	review: [
		{
			id: "aiReviewEnabled",
			label: "AI Review Enabled",
			type: "switch",
			tooltip: "Enable AI code review for this repository",
			planRequired: "PRO",
		},
		{
			id: "abortOnClose",
			label: "Abort on close",
			type: "switch",
			tooltip: "Abort the review process when closing",
			planRequired: "PRO",
		},
		{
			id: "isProgressFortuneEnabled",
			label: "Progress Fortune",
			type: "switch",
			tooltip: "Enable AI progress fortune for this repository",
			planRequired: "PRO",
		},
		{
			id: "poemEnabled",
			label: "Poem on review",
			type: "switch",
			tooltip: "Enable AI poem for this repository",
			planRequired: "PRO",
		},
		{
			id: "highLevelSummaryEnabled",
			label: "High Level Summary",
			type: "switch",
			tooltip: "Show high level summaries in reviews",
			planRequired: "PRO",
		},
		{
			id: "showWalkThrough",
			label: "Show Walkthrough",
			type: "switch",
			tooltip: "Show walkthrough of the changes in reviews",
			planRequired: "PRO",
		},
	],
	issue: [
		{
			id: "issueEnabled",
			label: "Issue Enabled",
			type: "switch",
			tooltip: "Enable AI to suggest tags for issues.",
			planRequired: "PRO",
		},
		{
			id: "aiIssueTriageEnabled",
			label: "AI Issue Triage",
			type: "switch",
			tooltip: "Enable AI to suggest triage for issue.",
			planRequired: "PRO",
		},
		{
			id: "issueEmbedEnabled",
			label: "Issue Embed",
			type: "switch",
			tooltip: "Enable embedding for issue.",
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
						<SelectContent className="bg-gray-900 border-gray-700 text-white">
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

export default function RepoSettingsClient({
	repoId,
	repoName,
	plan,
	backendSettings,
	token,
	repoConfigId,
}: RepoSettingsClientProps) {
	const [settingsValues, setSettingsValues] = useState(backendSettings);
	const isProOrEnterprise = plan === "PRO" || plan === "ENTERPRISE";
	const isEnterprise = plan === "ENTERPRISE";

	const handleApplyChanges = async () => {
		const configData: Record<string, any> = {};

		const configMapping: Record<string, string> = {
			general: "generalConfig",
			review: "reviewConfig",
			issue: "issueConfig",
			"knowledge-base": "knowledgeBase",
			"code-generation": "codeGeneration",
		};

		Object.entries(settingsConfig).forEach(([section, settings]) => {
			const configKey = configMapping[section];

			if (configKey) {
				if (!configData[configKey]) {
					configData[configKey] = {};
				}

				settings.forEach((setting) => {
					const settingId = setting.id;
					if (
						settingsValues[settingId] !== undefined &&
						settingsValues[settingId] !== backendSettings[settingId]
					) {
						configData[configKey][settingId] = settingsValues[settingId];
					}
				});

				if (Object.keys(configData[configKey]).length === 0) {
					delete configData[configKey];
				}
			}
		});

		if (Object.keys(configData).length === 0) {
			toast.info("No changes to save");
			return;
		}
		const response = await axios.patch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/repositories/repository/${repoId}`,
			{ ...configData, repoConfigId },
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response;
	};
	const { loading, run } = useLoading(
		handleApplyChanges,
		"Applied changes.",
		"Failed to apply changes, please try again."
	);

	return (
		<div className="flex-1 p-6">
			<div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
				<h1 className="text-2xl font-bold">{repoName}</h1>
				<Button
					onClick={() => run()}
					className="hover:cursor-pointer bg-primary min-w-[120px] flex items-center justify-center"
				>
					{loading ? <LoaderComponent /> : "Apply Changes"}
				</Button>
			</div>

			<Tabs
				defaultValue="general"
				className="w-full"
			>
				<TabsList className="bg-gray-900 mb-4 flex-wrap">
					{Object.keys(settingsConfig).map((section) => (
						<TabsTrigger
							key={section}
							value={section}
						>
							{section.replace("-", " ")}
						</TabsTrigger>
					))}
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
}
