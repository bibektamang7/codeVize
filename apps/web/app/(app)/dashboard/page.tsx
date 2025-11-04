import React from "react";
import DashboardPage from "@/pages/Dashboard";
import axios from "axios";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";

const page = async () => {
	const session = await auth();
	if (!session || !session.user?.token) {
		redirect("/login");
	}
	const response = await axios.get(`${process.env.BACKEND_URL}/repositories/`, {
		headers: {
			Authorization: `Bearer ${session.user.token}`,
		},
	});

	return (
		<DashboardPage
			repositories={response.data.repositories || []}
			token={session.user.token}
		/>
	);
};

export default page;
