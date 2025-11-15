"use client";
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { signOut } from "next-auth/react";
import { useAuthUser } from "@/hooks/useAuthUser";

const ProfileDropdown = () => {
	const { isAuthenticated, user } = useAuthUser();
	const handleLogout = async () => {
		if (isAuthenticated && user) {
			await signOut({ redirect: true, redirectTo: "/" });
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="flex items-center gap-3 p-3 border-t border-sidebar-border cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors duration-200">
					<Avatar className="size-8">
						<AvatarImage
							src={user?.image as string}
							alt="User avatar image"
						/>
						<AvatarFallback>U</AvatarFallback>
					</Avatar>
					<div className="flex flex-col flex-1">
						<span className="text-sm font-medium">{user?.name}</span>
						<span className="text-xs text-muted-foreground">Admin</span>
					</div>
					<span className="ml-auto">▼</span>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="dark"
				align="start"
				side="top"
			>
				<DropdownMenuItem
					className="flex items-center gap-2 cursor-pointer"
					onClick={handleLogout}
				>
					<LogOut className="size-4" />
					<span>Logout</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileDropdown;
