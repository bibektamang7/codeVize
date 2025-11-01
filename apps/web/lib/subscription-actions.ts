"use server";

import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";
import axios from "axios";

export async function subscribeToPlan(planName: string) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}
	try {
		const response = await axios.post(
			`${process.env.BACKEND_URL}/payments/`,
			{
				planName,
			},
			{
				headers: {
					Authorization: `Bearer ${session.user.token}`,
				},
			}
		);
		console.log("this is reposne", response.data);
		const { payment_url, redirect_url } = response.data;
		console.log("this is payment url", payment_url, redirect_url);
		redirect(payment_url || redirect_url);
	} catch (error) {
		console.error("Failed to subscribe to plan:", error);
		if ((error as any).digest?.startsWith("NEXT_REDIRECT")) {
			throw error;
		}
		throw new Error("Failed to subscribe to plan");
	}
}
