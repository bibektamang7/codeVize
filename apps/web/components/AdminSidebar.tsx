"use client";
import React from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
	CreditCard,
	GitBranch,
	LayoutDashboard,
	LogOut,
	User,
} from "lucide-react";

const menuItems = [
	{ title: "Dashboard", url: "/admin", Icon: LayoutDashboard },
	{ title: "Users", url: "/admin/users", Icon: User },
	{ title: "Repositories", url: "/admin/repositories", Icon: GitBranch },
	{ title: "Payments", url: "/admin/payments", Icon: CreditCard },
];

const AdminSidebar = () => {
	const pathname = usePathname();
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="text-lg font-bold text-center">Admin</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.url}
									>
										<Link href={item.url}>
											<item.Icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => {
								console.log("Logout clicked");
							}}
						>
							<LogOut />
							<span>Logout</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
};

export default AdminSidebar;
