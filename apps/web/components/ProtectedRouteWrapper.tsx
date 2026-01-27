"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import LoaderComponent from "@/components/Loader";

interface ProtectedRouteWrapperProps {
	children: ReactNode;
	requireAdmin?: boolean;
}

const ProtectedRouteWrapper = ({
	children,
	requireAdmin = false,
}: ProtectedRouteWrapperProps) => {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return;

		if (!session) {
			router.push("/login");
			return;
		}

		if (requireAdmin && session.user?.role !== "ADMIN") {
			router.push("/dashboard");
			return;
		}
	}, [session, status, router, requireAdmin]);

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center h-screen">
				<LoaderComponent />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	if (requireAdmin && session.user?.role !== "ADMIN") {
		return null;
	}

	return <>{children}</>;
};

export default ProtectedRouteWrapper;
