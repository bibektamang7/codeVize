import React from "react";
import DashboardPage from "@/pages/Dashboard";
import { SessionProvider } from "next-auth/react";
import axios from "axios";
import { auth } from "@/app/api/auth/[...nextauth]/auth";

const page = async () => {
	const session = await auth();
	if (!session || !session.accessToken) {
		return;
	}
	const response = await axios.get(`${process.env.BACKEND_URL}`, {
		headers: {
			Authorization: `Bearer ${session.accessToken}`,
		},
	});

	return (
		<SessionProvider>
			<DashboardPage repositories={response.data || []} />
		</SessionProvider>
	);
};

export default page;
