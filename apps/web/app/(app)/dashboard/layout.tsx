import DashboardSidebar from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<section className="dark  min-h-screen w-max-screen w-full overflow-hidden relative">
			<SidebarProvider>
				<SidebarTrigger />
				<DashboardSidebar />
				{children}
			</SidebarProvider>
		</section>
	);
};

export default DashboardLayout;
