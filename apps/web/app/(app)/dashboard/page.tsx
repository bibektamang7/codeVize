import React from "react";
import DashboardPage from "@/pages/Dashboard";
import { SessionProvider } from "next-auth/react";

const page = () => {
	// return <DashboardPage />;
	return (
		<SessionProvider>
			<DashboardPage />
		</SessionProvider>
	);
};

export default page;
