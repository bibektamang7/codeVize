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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import EmptyRepoPage from "./EmptyRepo";
import ListRepos from "./dashboard/ListRepos";

interface RepoProps {
	id: string;
	name: string;
	repo: string;
	lastReview: string;
	createdAt: Date;
	branch: string;
}

const Dashboard = () => {
	const projects: RepoProps[] = [
		// {
		// 	id: 1,
		// 	name: "frontend-app",
		// 	repo: "company/frontend-app",
		// 	lastReview: "fix: authentication flow",
		// 	timestamp: "2 hours ago",
		// 	branch: "main",
		// },
		// {
		// 	id: 2,
		// 	name: "api-service",
		// 	repo: "company/api-service",
		// 	lastReview: "feat: add user permissions",
		// 	timestamp: "5 hours ago",
		// 	branch: "feature/permissions",
		// },
		// {
		// 	id: 3,
		// 	name: "mobile-client",
		// 	repo: "company/mobile-client",
		// 	lastReview: "refactor: optimize performance",
		// 	timestamp: "1 day ago",
		// 	branch: "main",
		// },
		// {
		// 	id: 4,
		// 	name: "dashboard-ui",
		// 	repo: "company/dashboard-ui",
		// 	lastReview: "Connect Git Repository",
		// 	timestamp: "3 days ago",
		// 	branch: "develop",
		// },
	];

	return (
		<div className="bg-black text-white">
			<div className="flex h-full ">
				<aside className="w-80 border-r border-gray-800 bg-black p-6 h-screen">
					<div className="">
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
					<div className="bg-[#2a2a2a] rounded-xl p-4 shadow-lg mt-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-white">Token Usage</h3>
							<button className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full hover:bg-gray-700">
								Upgrade
							</button>
						</div>
						<div className="text-center mb-4">
							<p className="text-xs text-gray-400">Used</p>
							<p className="text-3xl font-bold text-white">0</p>
							<p className="text-sm text-gray-500">of 100,000 tokens</p>
						</div>
						<div className="w-full bg-[#3e3e3e] rounded-full h-2.5 mb-2">
							<div
								className="bg-green-500 h-2.5 rounded-full"
								style={{ width: "0%" }}
							></div>
						</div>
						<p className="text-xs text-gray-500 text-center">
							Your limit will reset in 10 days.
						</p>
					</div>
				</aside>
				<ListRepos />
			</div>
		</div>
	);
};

export default Dashboard;
