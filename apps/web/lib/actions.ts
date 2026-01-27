"use server";

import { auth } from "@/app/api/auth/[...nextauth]/auth";
import axios from "axios";
import { toast } from "sonner";

export async function getAvailablePlans() {
	try {
		const response = await axios.get(`${process.env.BACKEND_URL}/plans/`);
		const { plans } = response.data;
		return plans;
	} catch (error) {
		console.error("Failed to fetch plans:", error);
		throw new Error("Failed to fetch plans");
	}
}

export async function getReposWithErrorLogs() {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}

	try {
		const response = await axios.get(
			`${process.env.BACKEND_URL}/repositories/repositories-logs`,
			{
				headers: {
					Authorization: `Bearer ${session.user.token}`,
				},
			},
		);
		const { repos } = response.data;

		return repos;
	} catch (error) {
		console.log(error, "this is in error logs");
		toast.error(
			"Failed to fetch repositories with error logs, please try again.",
		);
	}
}
