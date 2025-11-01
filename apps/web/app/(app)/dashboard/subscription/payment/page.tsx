"use client";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const SubscriptionPayment = () => {
	const { data, update } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const success = searchParams?.get("success");
	const plan = searchParams?.get("plan");

	useEffect(() => {
		if (success === "true" && plan) {
			const updateSession = async () => {
				await update({
					...data,
					plan,
				});
			};
			updateSession();
		}

		router.push("/dashboard");
	}, []);

	return null;
};

export default SubscriptionPayment;
