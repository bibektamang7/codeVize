import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Button } from "./ui/button";
import { Code } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";

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
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Code
								className="rotate-90"
								size={14}
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-gray-400 mt-4 px-12">
							<DropdownMenuLabel>My account</DropdownMenuLabel>
							<DropdownMenuLabel>Upgrage</DropdownMenuLabel>
							<DropdownMenuLabel>Logout</DropdownMenuLabel>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="flex items-center gap-4">
					<nav className="border-b border-gray-800 bg-black">
						<div className="flex items-center px-6">
							{dashboardNavLists.map((list, index) => (
								<Button
									key={list.title}
									variant={"ghost"}
									className={` px-4 py-3 text-sm rounded-md border-b-2 ${"border-transparent text-gray-400 hover:bg-indigo-500 hover:text-white"}`}
								>
									<Link href={list.redirectTo}>{list.title}</Link>
								</Button>
							))}
						</div>
					</nav>
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
