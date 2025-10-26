"use client";
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
import { useEffect, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { BadgeAlert } from "lucide-react";

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
	setStateValues: React.Dispatch<React.SetStateAction<SettingsValues>> | null;
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
		if (setStateValues) {
			setStateValues((prev) => ({ ...prev, [id]: value }));
		}
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
						checked={(stateValues?.[id] as boolean) ?? true}
						onCheckedChange={(value) => updateState(id, value)}
						disabled={isDisabled}
					/>
				);
			case "input":
				return (
					<Input
						id={id}
						type={(setting as InputSetting).inputType || "text"}
						defaultValue={(setting as InputSetting).defaultValue}
						value={(stateValues?.[id] as string) || ""}
						onChange={(e) => updateState(id, e.target.value)}
						disabled={isDisabled}
						className="w-full sm:w-[300px] bg-gray-900 border-gray-700"
					/>
				);
			case "select":
				return (
					<Select
						defaultValue={(setting as SelectSetting).defaultValue || (setting as SelectSetting).selectOptions?.[0]?.value}
						onValueChange={(value) => updateState(id, value)}
					>
						<SelectTrigger
							id={id}
							className="w-full sm:w-[180px] bg-gray-900 border-gray-700"
						>
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
											className={`${isDisabled ? "text-gray-600" : "text-gray-400"}`}
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

export default function RepoSettingsPage({
	params,
}: {
	params: { id: string };
}) {
	// const { plan } = useGetUserPlan();
	const plan = { name: "ENTERPRISE" };
	const [settingsValues, setSettingsValues] = useState<SettingsValues>({
		"tone-instructions": "",
		"early-access": false,
		"enable-free-tier": true,
	});

	// Determine which features are available based on user plan
	const isProOrEnterprise = plan?.name === "PRO" || plan?.name === "ENTERPRISE";
	const isEnterprise = plan?.name === "ENTERPRISE";

	const handleApplyChanges = async () => {
		// Dummy API call for applying changes
		console.log("Applying changes...");
		console.log(settingsValues);

		// In a real implementation, this would make an actual API call
		// await fetch(`/api/repo/${params.id}/settings`, {
		//   method: "POST",
		//   headers: { "Content-Type": "application/json" },
		//   body: JSON.stringify(settingsValues)
		// });

		alert("Changes applied successfully!");
	};

	return (
		<div className="flex-1 p-6">
			<div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
				<h1 className="text-2xl font-bold">{params.id}</h1>
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

				<TabsContent
					value="general"
					className="space-y-6"
				>
					<SettingsCard
						title="General Settings"
						settings={settingsConfig.general!}
						stateValues={settingsValues}
						setStateValues={setSettingsValues}
						isProOrEnterprise={isProOrEnterprise}
						isEnterprise={isEnterprise}
					/>
				</TabsContent>

				<TabsContent
					value="review"
					className="space-y-6"
				>
					<SettingsCard
						title="Review Settings"
						settings={settingsConfig.review!}
						stateValues={{}}
						setStateValues={null}
						isProOrEnterprise={isProOrEnterprise}
						isEnterprise={isEnterprise}
					/>
				</TabsContent>

				<TabsContent
					value="knowledge-base"
					className="space-y-6"
				>
					<SettingsCard
						title="Knowledge Base Settings"
						settings={settingsConfig["knowledge-base"]!}
						stateValues={{}}
						setStateValues={null}
						isProOrEnterprise={isProOrEnterprise}
						isEnterprise={isEnterprise}
					/>
				</TabsContent>

				<TabsContent
					value="code-generation"
					className="space-y-6"
				>
					<SettingsCard
						title="Code Generation Settings"
						settings={settingsConfig["code-generation"]!}
						stateValues={{}}
						setStateValues={null}
						isProOrEnterprise={isProOrEnterprise}
						isEnterprise={isEnterprise}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
