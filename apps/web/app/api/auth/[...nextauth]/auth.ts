import NextAuth, { NextAuthResult, Profile } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prismaClient } from "db/prisma";
import jwt from "jsonwebtoken";

type GithubProfile = Profile & {
	login: string;
	avatar_url: string;
	id: string;
	email?: string | null;
};

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
	throw new Error("Missing GitHub OAuth credentials in environment variables.");
}

if (!process.env.AUTH_SECRET) {
	throw new Error("Missing AUTH_SECRET in environment variables.");
}

const nextAuth = NextAuth({
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			authorization: { params: { scope: "read:user user:email" } },
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 24 * 7, // 7 days
	},
	secret: process.env.AUTH_SECRET,

	callbacks: {
		async signIn({ account, profile }) {
			if (account?.provider !== "github") return true;

			const githubProfile = profile as GithubProfile;
			if (!githubProfile?.email || !githubProfile.login || !githubProfile.id) {
				console.warn("GitHub profile missing required fields:", githubProfile);
				return false;
			}

			try {
				let githubUser = await prismaClient.user.findUnique({
					where: { githubId: githubProfile.id.toString() },
				});

				if (!githubUser) {
					githubUser = await prismaClient.user.create({
						data: {
							email: githubProfile.email,
							username: githubProfile.login,
							image: githubProfile.avatar_url,
							githubId: githubProfile.id.toString(),
							plan: { connect: { name: "FREE" } },
						},
					});
				}

				(account as any).dbUser = githubUser;
				return true;
			} catch (err) {
				console.error("Error during GitHub OAuth signIn:", err);
				return false; // Block login gracefully
			}
		},

		async jwt({ token, account }) {
			// Only enrich token on sign-in
			if (account && (account as any).dbUser) {
				const dbUser = (account as any).dbUser;

				token.id = dbUser.id;
				token.email = dbUser.email;
				token.name = dbUser.username;
				token.picture = dbUser.image;

				if (process.env.TOKEN_SECRET) {
					token.accessToken = jwt.sign(
						{ id: dbUser.id },
						process.env.TOKEN_SECRET,
						{ expiresIn: "7d" }
					);
				}
			}
			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.name = token.name as string;
				session.user.image = token.picture as string;
			}
			if (token.accessToken) {
				(session as any).accessToken = token.accessToken as string;
			}
			return session;
		},
	},
});

const handlers: NextAuthResult["handlers"] = nextAuth.handlers;
const auth: NextAuthResult["auth"] = nextAuth.auth;
const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
const signOut: NextAuthResult["signOut"] = nextAuth.signOut;

export { handlers, auth, signIn, signOut };
