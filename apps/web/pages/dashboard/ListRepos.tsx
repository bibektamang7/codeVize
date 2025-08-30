"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetRepositories } from "@/hooks/useGetRepositories";
import {
	Archive,
	Bell,
	ExternalLink,
	Eye,
	GitBranch,
	GitPullRequest,
	Link,
	MoreHorizontal,
	Plus,
	Shield,
	Trash2,
} from "lucide-react";
import React from "react";
import EmptyRepoPage from "../EmptyRepo";

const ListRepos = () => {
	// const { repos } = useGetRepositories();
	const repos = [] as any;
	return (
		<main className="flex-1 p-6">
			{repos.length !== 0 ? (
				<div>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg tracking-tight">Repositories</h2>
						<Button className="bg-white text-black hover:bg-gray-200">
							<Plus className="w-4 h-4 mr-2" />
							New Repository
						</Button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{repos.map((project: any) => (
							<Link
								href={`/repository/${project.id}`}
								key={project.id}
							>
								<Card className="bg-black border-gray-800 hover:border-gray-700 transition-colors cursor-pointer">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div>
												<CardTitle className="text-base text-white font-semibold">
													{project.repoName}
												</CardTitle>
											</div>
											<div className="flex items-center gap-2">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="w-6 h-6 text-gray-400 hover:text-white"
														>
															<MoreHorizontal className="w-3 h-3" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="w-56 bg-gray-900 border-gray-700"
													>
														<DropdownMenuLabel className="text-gray-300">
															Project Settings
														</DropdownMenuLabel>
														<DropdownMenuSeparator className="bg-gray-700" />

														<DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
															<Eye className="w-4 h-4 mr-2" />
															View Details
														</DropdownMenuItem>

														<DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
															<GitPullRequest className="w-4 h-4 mr-2" />
															Review Settings
														</DropdownMenuItem>

														<DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
															<Shield className="w-4 h-4 mr-2" />
															Access Control
														</DropdownMenuItem>

														<DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
															<Bell className="w-4 h-4 mr-2" />
															Notifications
														</DropdownMenuItem>

														<DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
															<ExternalLink className="w-4 h-4 mr-2" />
															Open Repository
														</DropdownMenuItem>

														<DropdownMenuSeparator className="bg-gray-700" />

														<DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
															<Archive className="w-4 h-4 mr-2" />
															Archive Project
														</DropdownMenuItem>

														<DropdownMenuItem className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer">
															<Trash2 className="w-4 h-4 mr-2" />
															Delete Project
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</div>
									</CardHeader>

									{/* <CardContent>
										<div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
											<GitBranch className="w-4 h-4" />
											<span>{project.repo}</span>
										</div>

										<div className="space-y-2">
											<p className="text-sm font-medium text-white/85">
												{project.}
											</p>
											<div className="flex items-center justify-between text-xs text-gray-400">
												<div className="flex items-center gap-4">
													<span>{project.createdAt.toDateString()}</span>
													<div className="flex items-center gap-1">
														<GitBranch className="w-3 h-3" />
														<span>{project.branch}</span>
													</div>
												</div>
											</div>
										</div>
									</CardContent> */}
								</Card>
							</Link>
						))}
					</div>
				</div>
			) : (
				<EmptyRepoPage />
			)}
		</main>
	);
};

export default ListRepos;
