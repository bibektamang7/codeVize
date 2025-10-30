import { CodeXml } from "lucide-react";
import Link from "next/link";
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
} from "./ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
	LayoutDashboard,
	CreditCard,
	MessageCircleWarning,
} from "lucide-react";

const sidebarMenu = [
	{
		item: "Dashboard",
		link: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		item: "Subscription",
		link: "/dashboard/subscription",
		icon: CreditCard,
	},

	{
		item: "Error logs",
		link: "/dashboard/error-logs",
		icon: MessageCircleWarning,
	},
];

const DashboardSidebar = () => {
	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-3 p-3">
					<Avatar className="size-8">
						<AvatarImage
							src="/code.png"
							alt="User"
						/>
						<AvatarFallback>U</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<h2 className="text-lg font-semibold">CodeVize</h2>
						{/* <p className="text-sm text-muted-foreground">Change Organization</p> */}
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{sidebarMenu.map((element) => (
								<SidebarMenuItem key={element.item}>
									<SidebarMenuButton asChild>
										<Link
											href={element.link}
											className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 hover:bg-sidebar-accent"
										>
											<element.icon className="size-5" />
											<span className="text-sm font-medium tracking-wide">
												{element.item}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<div className="flex items-center gap-3 p-3 border-t border-sidebar-border">
					<Avatar className="size-8">
						<AvatarImage
							src="/placeholder-user.jpg"
							alt="User"
						/>
						<AvatarFallback>U</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="text-sm font-medium">Bibek7here</span>
						<span className="text-xs text-muted-foreground">Admin</span>
					</div>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
};

export default DashboardSidebar;
