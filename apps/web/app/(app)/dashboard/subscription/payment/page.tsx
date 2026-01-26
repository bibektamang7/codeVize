"use client";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SubscriptionPayment = () => {
	const { data: session, status, update } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const success = searchParams?.get("success");
	const plan = searchParams?.get("plan");

	const [processed, setProcessed] = useState(false);

	useEffect(() => {
		if (processed) return;

		if (success === "true" && plan) {
			const run = async () => {
				await update({ ...session, plan });
				setProcessed(true);
				router.push("/dashboard/subscription");
			};

			run();
		} else if (success === "false") {
			router.push("/dashboard");
		}
	}, [status, success, plan, update, router, processed]);

	return (
		<div className="w-full flex justify-center items-center h-screen">
			<p>Processing payment and updating session...</p>
		</div>
	);
};

export default SubscriptionPayment;
