import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useAuthUser = () => {
	const { data: session, status } = useSession();

	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		if (status === "authenticated" && session?.user) {
			setUser(session.user as User);
		} else if (status === "unauthenticated" || status === "loading") {
			setUser(null);
		}
	}, [status, session]);

	return {
		user,
		status,
		isAuthenticated: status === "authenticated",
	};
};
