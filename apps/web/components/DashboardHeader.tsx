import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Button } from "./ui/button";
import { Code, User, LogOut, Gem } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { auth } from "@/app/api/auth/[...nextauth]/auth";

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

const DashboardHeader = async () => {
	const session = await auth();

	return (
		<header className="border-b border-gray-800 bg-black">
			<div className="flex items-center justify-between px-6 py-3">
				<div className="flex items-center gap-2">
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<div className="flex items-center gap-2 hover:cursor-pointer">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={session?.user?.image!}
										alt={session?.user?.name?.charAt(0)}
									/>
									<AvatarFallback className="bg-purple-600 text-xs text-white">
										{session?.user?.name?.charAt(0)}
									</AvatarFallback>
								</Avatar>

								<span className="text-lg font-medium">
									{session?.user?.name}'s projects
								</span>
								<Code
									className="rotate-90"
									size={14}
								/>
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-56"
							align="end"
							forceMount
						>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">
										{session?.user?.name}
									</p>
									<p className="text-xs leading-none text-muted-foreground">
										{session?.user?.email}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="hover:cursor-pointer">
								<User className="mr-2 h-4 w-4" />
								<span>My Account</span>
							</DropdownMenuItem>
							<DropdownMenuItem className="hover:cursor-pointer">
								<Gem className="mr-2 h-4 w-4" />
								<span>Upgrade</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="hover:cursor-pointer">
								<LogOut className="mr-2 h-4 w-4" />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="flex items-center gap-4">
					<nav>
						<div className="flex items-center">
							{dashboardNavLists.map((list) => (
								<Button
									key={list.title}
									variant="ghost"
									className="px-4 py-3 text-sm rounded-md border-b-2 border-transparent text-gray-400 hover:bg-indigo-500 hover:text-white"
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
