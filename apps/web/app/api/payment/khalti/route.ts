// app/api/payment/khalti/route.ts
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prismaClient } from "db/prisma";

// API route to handle Khalti payment verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pidx = searchParams.get("pidx");
  const transactionId = searchParams.get("transaction_id");
  const status = searchParams.get("status");

  if (!pidx || !transactionId || !status) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    // Verify the payment with Khalti
    // const response = await fetch(`https://khalti.com/api/v2/epayment/lookup/`, {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ pidx }),
    // });
    //
    // const paymentData = await response.json();
    //
    // if (!response.ok || paymentData.status !== "Completed") {
    //   return NextResponse.json(
    //     { error: "Payment verification failed" },
    //     { status: 400 }
    //   );
    // }

    // For demo purposes, assuming the payment is valid
    // In a real implementation, you would verify with Khalti's API
    const payment = await prismaClient.payment.findFirst({
      where: {
        // In a real implementation, you'd look up the payment by pidx or transaction_id
        // For demo, we'll assume it's valid
        status: "pending",
        // Add more specific conditions here in real implementation
      },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Update the payment status to completed and update user's plan
    await prismaClient.$transaction([
      // Update payment status
      prismaClient.payment.update({
        where: { id: payment.id },
        data: { 
          status: "completed",
          amount: payment.amount, // Actual amount from Khalti verification
        },
      }),
      // Update user's plan
      prismaClient.user.update({
        where: { id: payment.userId },
        data: { planName: payment.plan.name },
      }),
    ]);

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/dashboard/subscription?success=true&plan=${payment.plan.name}`, request.url)
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}