import AdminSidebar from "@/components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import AuthLayout from "@/components/AuthLayout";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex h-screen bg-gray-50">
			<SidebarProvider className="w-fit">
				<AdminSidebar />
			</SidebarProvider>
			<SessionProvider>
				<AuthLayout>
					<main className="flex-1 p-6 bg-gray-50">{children}</main>
				</AuthLayout>
			</SessionProvider>
		</div>
	);
};

export default AdminLayout;
