import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
	interface User {
		token: string;
		plan: string;
	}
}
