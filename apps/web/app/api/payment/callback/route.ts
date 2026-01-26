import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams;
	const pidx = searchParams.get("pidx");

	if (!pidx) {
		return NextResponse.json({ error: "Missing pidx" }, { status: 400 });
	}
	const response = await fetch(
		`${process.env.BACKEND_URL}/payments/payment/callback`,
		{
			method: "PATCH",
			body: JSON.stringify({ pidx }),
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	if (!response.ok) {
		return NextResponse.redirect(
			"http://localhost:3000/dashboard/subscription/payment?error=payment_failed"
		);
	}

	const data = await response.json();

	return NextResponse.redirect(
		`http://localhost:3000/dashboard/subscription/payment?success=true&plan=${data.plan}`
	);
}
