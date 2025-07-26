import {
	Bell,
	GitBranch,
	Activity,
	MoreHorizontal,
	Eye,
	GitPullRequest,
	Shield,
	Trash2,
	Archive,
	ExternalLink,
	Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const Dashboard = () => {
	const projects = [
		{
			id: 1,
			name: "frontend-app",
			repo: "company/frontend-app",
			lastReview: "fix: authentication flow",
			timestamp: "2 hours ago",
			branch: "main",
		},
		{
			id: 2,
			name: "api-service",
			repo: "company/api-service",
			lastReview: "feat: add user permissions",
			timestamp: "5 hours ago",
			branch: "feature/permissions",
		},
		{
			id: 3,
			name: "mobile-client",
			repo: "company/mobile-client",
			lastReview: "refactor: optimize performance",
			timestamp: "1 day ago",
			branch: "main",
		},
		{
			id: 4,
			name: "dashboard-ui",
			repo: "company/dashboard-ui",
			lastReview: "Connect Git Repository",
			timestamp: "3 days ago",
			branch: "develop",
		},
	];

	return (
		<div className="min-h-screen bg-black text-white">
			<header className="border-b border-gray-800 bg-black">
				<div className="flex items-center justify-between px-6 py-3">
					<div className="flex items-center gap-2">
						<Avatar className="w-6 h-6">
							<AvatarImage src="/placeholder.svg?height=24&width=24" />
							<AvatarFallback className="bg-purple-600 text-xs">
								CR
							</AvatarFallback>
						</Avatar>
						<span className="text-sm font-medium">codevize's projects</span>
					</div>

					<div className="flex items-center gap-4">
						<nav className="border-b border-gray-800 bg-black">
							<div className="flex items-center px-6">
								{["Overview", "Reviews", "Issues", "Settings"].map(
									(item, index) => (
										<Button
											key={item}
											variant="ghost"
											className={`px-4 py-3 text-sm rounded-none border-b-2 ${
												index === 0
													? "border-white text-white"
													: "border-transparent text-gray-400 hover:text-white"
											}`}
										>
											{item}
										</Button>
									)
								)}
							</div>
						</nav>
						<Avatar className="w-8 h-8">
							<AvatarImage src="/placeholder.svg?height=32&width=32" />
							<AvatarFallback className="bg-green-600">CR</AvatarFallback>
						</Avatar>
					</div>
				</div>
			</header>

			<div className="flex">
				<aside className="w-80 border-r border-gray-800 bg-black p-6">
					<div>
						<h3 className="text-lg  mb-4">Recent Reviews</h3>
						<Card className="bg-black border-gray-800">
							<CardContent className="p-6 text-center">
								<Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
								<p className="text-sm text-gray-400">
									Recent code reviews and issue tags will appear here.
								</p>
							</CardContent>
						</Card>
					</div>
				</aside>

				<main className="flex-1 p-6">
					<div>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg tracking-tight">Repositories</h2>
							<Button className="bg-white text-black hover:bg-gray-200">
								<Plus className="w-4 h-4 mr-2" />
								New Repository
							</Button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{projects.map((project) => (
								<Link
									href={`/repository/${project.id}`}
									key={project.id}
								>
									<Card className="bg-black border-gray-800 hover:border-gray-700 transition-colors cursor-pointer">
										<CardHeader>
											<div className="flex items-start justify-between">
												<div>
													<CardTitle className="text-base text-white font-semibold">
														{project.name}
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

										<CardContent>
											<div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
												<GitBranch className="w-4 h-4" />
												<span>{project.repo}</span>
											</div>

											<div className="space-y-2">
												<p className="text-sm font-medium text-white/85">
													{project.lastReview}
												</p>
												<div className="flex items-center justify-between text-xs text-gray-400">
													<div className="flex items-center gap-4">
														<span>{project.timestamp}</span>
														<div className="flex items-center gap-1">
															<GitBranch className="w-3 h-3" />
															<span>{project.branch}</span>
														</div>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default Dashboard;
