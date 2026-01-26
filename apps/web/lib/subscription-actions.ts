"use server";

import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";
import axios from "axios";

export async function subscribeToPlan(planName: string) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}
	let response;
	try {
		response = await axios.post(
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
	} catch (error) {
		console.error("Failed to subscribe to plan:", error);
		throw new Error("Failed to subscribe to plan");
	}
	const { payment_url, redirect_url } = response.data;
	const redirectURL = payment_url || redirect_url;
	redirect(redirectURL);
}
