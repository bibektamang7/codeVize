import DashboardSidebar from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import React from "react";
import ProtectedRouteWrapper from "@/components/ProtectedRouteWrapper";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<SessionProvider>
			<ProtectedRouteWrapper>
				<section className="dark min-h-screen w-max-screen w-full overflow-hidden relative">
					<SidebarProvider>
						<SidebarTrigger />
						<DashboardSidebar />
						{children}
					</SidebarProvider>
				</section>
			</ProtectedRouteWrapper>
		</SessionProvider>
	);
};

export default DashboardLayout;
