"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { prismaClient } from "db/prisma";
import { redirect } from "next/navigation";

// Handle subscription to a plan
export async function subscribeToPlan(planId: string, amount: number) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}

	try {
		// Create a payment record
		const payment = await prismaClient.payment.create({
			data: {
				userId: session.user.id,
				planId,
				amount,
				status: "completed", // For demo purposes, setting as completed immediately
			},
			include: {
				plan: true,
			},
		});

		// Update user's plan
		await prismaClient.user.update({
			where: { id: session.user.id },
			data: {
				planName: payment.plan.name,
			},
		});

		revalidatePath("/dashboard/subscription");
		return payment;
	} catch (error) {
		console.error("Failed to subscribe to plan:", error);
		throw new Error("Failed to subscribe to plan");
	}
}

// Initialize Khalti payment
export async function initiateKhaltiPayment(planId: string, amount: number) {
	const session = await auth();

	if (!session?.user?.id) {
		throw new Error("User not authenticated");
	}

	// In a real implementation, you would:
	// 1. Call Khalti's API to create a payment session
	// 2. Return the payment URL to redirect the user

	const returnUrl = `${process.env.NEXTAUTH_URL}/api/payment/khalti`;
	const websiteUrl =
		process.env.NEXT_PUBLIC_BASE_URL ||
		process.env.NEXTAUTH_URL ||
		"http://localhost:3000";

	// const paymentData = {
	//   amount: amount * 100, // Convert to paisa (Khalti uses paisa)
	//   purchase_order_id: `order_${session.user.id}_${Date.now()}`,
	//   return_url: returnUrl,
	//   website_url: websiteUrl,
	// };
	//
	// const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
	//   method: "POST",
	//   headers: {
	//     "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
	//     "Content-Type": "application/json",
	//   },
	//   body: JSON.stringify(paymentData)
	// });
	//
	// if (!response.ok) {
	//   throw new Error("Failed to initiate Khalti payment");
	// }
	//
	// const data = await response.json();
	// return data;

	// For now, we'll simulate the process by creating the payment record directly
	// and redirecting to a mock payment page
	const payment = await subscribeToPlan(planId, amount);

	// In a real Khalti implementation, you would redirect to data.payment_url
	redirect(
		`https://example.com/mock-payment-page?pidx=${payment.id}&plan=${payment.plan.name}`
	);

	return payment;
}
