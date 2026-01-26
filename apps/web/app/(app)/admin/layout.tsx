import AdminSidebar from "@/components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import ProtectedRouteWrapper from "@/components/ProtectedRouteWrapper";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SessionProvider>
			<ProtectedRouteWrapper requireAdmin={true}>
				<div className="flex h-screen bg-gray-50">
					<SidebarProvider className="w-fit">
						<AdminSidebar />
					</SidebarProvider>
					<main className="flex-1 p-6 bg-gray-50">{children}</main>
				</div>
			</ProtectedRouteWrapper>
		</SessionProvider>
	);
};

export default AdminLayout;
