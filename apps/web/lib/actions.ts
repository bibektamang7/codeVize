"use server";

import axios from "axios";

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
