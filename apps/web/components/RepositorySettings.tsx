import { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

const RepositorySettings = () => {
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


export default RepositorySettings