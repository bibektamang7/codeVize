import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Button } from "./ui/button";

const dashboardNavLists = [
	{
		title: "Overview",
		redirectTo: "/dashboard",
	},
	{
		title: "Reviews",
		redirectTo: "/dashboard/reviews",
	},
	{
		title: "Issues",
		redirectTo: "/dashboard/issues",
	},
];

const DashboardHeader = () => {
	return (
		<header className="border-b border-gray-800 bg-black">
			<div className="flex items-center justify-between px-6 py-3">
				<div className="flex items-center gap-2">
					<Avatar className="w-6 h-6">
						<AvatarImage src="/placeholder.svg?height=24&width=24" />
						<AvatarFallback className="bg-purple-600 text-xs">
							CR
						</AvatarFallback>
					</Avatar>
					<span className="text-lg font-medium">codevize's projects</span>
				</div>

				<div className="flex items-center gap-4">
					<nav className="border-b border-gray-800 bg-black">
						<div className="flex items-center px-6">
							{dashboardNavLists.map((list, index) => (
								<Link
									key={list.title}
									href={list.redirectTo}
									className={`px-4 py-3 text-sm rounded-none border-b-2 ${
										index === 0
											? "border-white text-white"
											: "border-transparent text-gray-400 hover:text-white"
									}`}
								>
									<Button variant={"ghost"}>{list.title}</Button>
								</Link>
							))}
						</div>
					</nav>
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
