import NextAuth, { Profile } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prismaClient } from "db/prisma";
import jwt from "jsonwebtoken";

type GithubProfile = Profile & {
	login: string;
	avatar_url: string;
};

export const { handlers, signIn, signOut } = NextAuth({
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 84600 * 7,
	},
	secret: process.env.AUTH_SECRET,
	callbacks: {
		async signIn({ account, profile, user }) {
			if (account?.provider === "github") {
				const githubProfile = profile as GithubProfile;
				if (
					!githubProfile?.email ||
					!githubProfile.avatar_url ||
					!githubProfile.login ||
					!githubProfile.id
				)
					return false;
				try {
					let githubUser = await prismaClient.user.findUnique({
						where: {
							githubId: githubProfile.id,
						},
					});
					if (!githubUser) {
						user = await prismaClient.user.create({
							data: {
								email: githubProfile.email,
								username: githubProfile.login,
								image: githubProfile.avatar_url,
								githubId: githubProfile.id,
							},
						});
					}
					if (!githubUser) return false;
					user.id = githubUser.id;
					user.email = githubUser.email;
					user.image = githubUser.image;
					user.name = githubUser.username;
					return true;
				} catch (error) {
					throw Error("Failed to GitHub OAuth");
				}
			}
			return true;
		},
		async jwt({ token, user, account, profile }) {
			if (account && profile) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
				token.picture = user.image;
				const signToken = jwt.sign(
					{
						id: user.id,
					},
					process.env.TOKEN_SECRET!,
					{
						expiresIn: "7d",
					}
				);
				token.accessToken = signToken;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.accessToken = token.accessToken as string;
				session.user.id = token.id as string;
				session.user.image = token.picture as string;
				session.user.name = token.name as string;
				session.user.email = token.email as string;
			}
			return session;
		},
	},
});
