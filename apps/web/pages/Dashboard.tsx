"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Settings, Search, Plus, ShieldX, GitBranch } from "lucide-react";
import Link from "next/link";
import { RepositoryProps } from "@/types/model.types";

interface DashboardPageProps {
	repositories: RepositoryProps[];
}

const DashboardPage = ({ repositories }: DashboardPageProps) => {
	const [search, setSearch] = useState("");

	const handleConnectGithubApp = () => {
		const url = process.env.NEXT_PUBLIC_GITHUB_APP_URL;
		window.location.href = `${url}/new?state=${"123"}`;
	};
	const filteredRepos = repositories.filter((r) =>
		r.repoName.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<>
			<main className="container mx-auto px-4 py-6 max-w-6xl">
				<header className="mb-6">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold">
								Your Repositories
							</h1>
							<p className="text-muted-foreground mt-1">
								Manage and configure your connected repositories
							</p>
						</div>
						<Button
							onClick={handleConnectGithubApp}
							className="bg-orange-500 hover:bg-orange-600 hover:cursor-pointer"
							aria-label="Add Repository"
						>
							<Plus className="mr-2 h-4 w-4" /> Add Repository
						</Button>
					</div>
				</header>

				<div className="mb-6 flex items-center gap-2 max-w-md w-full">
					<div className="relative flex-1">
						<Search
							className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
							aria-hidden="true"
						/>
						<Input
							placeholder="Search repositories..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							aria-label="Search repositories"
							className="pl-10 py-2 w-full rounded-lg border"
						/>
					</div>
				</div>

				<Card
					className="bg-card border-border shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl"
					role="region"
					aria-labelledby="repositories-heading"
				>
					<h2
						id="repositories-heading"
						className="sr-only"
					>
						Repositories List
					</h2>
					<CardContent className="p-0">
						{filteredRepos.length > 0 ? (
							<div className="divide-y divide-border">
								{filteredRepos.map((repo: RepositoryProps) => (
									<Link
										href={`/dashboard/repo/${repo.id}`}
										key={repo.repoId}
										className="block p-4 transition-colors hover:bg-accent hover:text-accent-foreground duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
										aria-label={`Navigate to ${repo.repoName} settings`}
									>
										<div
											role="listitem"
											className="flex items-center justify-between w-full"
										>
											<div className="flex items-center gap-3">
												<GitBranch
													className="h-5 w-5 text-muted-foreground"
													aria-hidden="true"
												/>
												<span
													className="font-semibold truncate max-w-xs md:max-w-md"
													aria-label={`Repository name: ${repo.repoName}`}
												>
													{repo.repoName}
												</span>
											</div>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<span
													className={`h-3 w-3 rounded-full ${repo.isActive ? "bg-green-500" : "bg-gray-400"}`}
													aria-label={
														repo.isActive
															? "Active repository"
															: "Inactive repository"
													}
													title={repo.isActive ? "Active" : "Inactive"}
												></span>
												<Button
													variant="ghost"
													size="sm"
													aria-label={`Settings for ${repo.repoName}`}
													onClick={(e) => {
														e.preventDefault();
														// Navigate to settings page - we'll implement this later if needed
														window.location.href = `/dashboard/repo/${repo.id}`;
													}}
													className="p-2 h-auto w-auto"
												>
													<Settings
														className="h-4 w-4"
														aria-hidden="true"
													/>
												</Button>
											</div>
										</div>
									</Link>
								))}
							</div>
						) : (
							<div
								role="alert"
								className="py-16 text-center flex flex-col items-center justify-center gap-4"
							>
								<div className="flex flex-col items-center justify-center gap-3 p-6 max-w-md mx-auto">
									<ShieldX
										className="h-12 w-12 text-muted-foreground"
										aria-hidden="true"
									/>
									<h3 className="text-xl font-semibold">
										No repositories found
									</h3>
									<p className="text-muted-foreground text-center">
										{search
											? "No repositories match your search. Try a different term."
											: "You haven't connected any repositories yet."}
									</p>
									{!search && (
										<Button
											onClick={handleConnectGithubApp}
											variant="outline"
											className="mt-4 w-full sm:w-auto hover:cursor-pointer bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border-orange-500/30"
											aria-label="Connect a new repository"
										>
											<Plus className="mr-2 h-4 w-4" /> Connect a Repository
										</Button>
									)}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</>
	);
};

export const RepositorySettings = () => {
	const [language, setLanguage] = useState("English (US)");
	const [freeTier, setFreeTier] = useState(true);

	return (
		<div className="flex min-h-screen text-foreground">
			<aside className="w-64 border-r border-border bg-card p-4 hidden md:block">
				<div className="mb-6">
					<h2 className="text-lg font-semibold">Bibek7here</h2>
					<p className="text-sm text-muted-foreground">Change Organization</p>
				</div>
			</aside>

			<main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
				<div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
					<h1 className="text-2xl font-bold">Ineuron-course</h1>
					<Button className="bg-orange-500 hover:bg-orange-600">
						Apply Changes
					</Button>
				</div>

				<Tabs
					defaultValue="general"
					className="w-full"
				>
					<TabsList className="mb-6 flex-wrap bg-muted p-1 w-full sm:w-auto justify-start overflow-x-auto">
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="review">Review</TabsTrigger>
						<TabsTrigger value="chat">Chat</TabsTrigger>
						<TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
						<TabsTrigger value="code">Code Generation</TabsTrigger>
					</TabsList>

					<TabsContent value="general">
						<Card className="bg-card border-border shadow-lg rounded-xl overflow-hidden">
							<CardHeader className="border-b bg-muted/30 p-6">
								<CardTitle className="text-xl">General Settings</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-6">
								<div className="space-y-2">
									<label className="text-sm font-medium">Review Language</label>
									<Select
										value={language}
										onValueChange={setLanguage}
									>
										<SelectTrigger className="w-full max-w-sm rounded-lg border bg-card py-2 px-3">
											<SelectValue placeholder="Select language" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="English (US)">English (US)</SelectItem>
											<SelectItem value="English (UK)">English (UK)</SelectItem>
											<SelectItem value="Nepali">Nepali</SelectItem>
										</SelectContent>
									</Select>
									<p className="text-xs text-muted-foreground mt-1">
										Default language is English
									</p>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium">
										Tone Instructions
									</label>
									<Input
										placeholder="Enter tone details..."
										className="w-full max-w-md"
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Define the tone to be used in AI responses for this
										repository
									</p>
								</div>

								<div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg border border-border space-y-2 sm:space-y-0">
									<div className="space-y-1">
										<span className="font-medium">Enable Free Tier</span>
										<p className="text-xs text-muted-foreground max-w-sm">
											Allow usage of free tier features for this repository
										</p>
									</div>
									<Switch
										checked={freeTier}
										onCheckedChange={setFreeTier}
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
};

export default DashboardPage;
