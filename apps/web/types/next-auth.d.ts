import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
	interface User {
		token: string;
		plan: string;
		role?: string;
	}

	interface Session {
		user: {
			id: string;
			email: string;
			name: string;
			image?: string;
			token: string;
			plan: string;
			role?: string;
		} & DefaultSession["user"];
	}
}
