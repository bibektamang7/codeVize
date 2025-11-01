import NextAuth, { NextAuthResult, Profile } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { retryApiCall, CircuitBreaker } from "@/lib/utils";
import axios from "axios";

const apiClient = axios.create({
	timeout: 10000,
});

const circuitBreaker = new CircuitBreaker();

const backendURL = process.env.BACKEND_URL;

if (!backendURL) {
	console.error("BACKEND_BASE_URL environment variable is not set");
}

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
		maxAge: 60 * 60 * 24 * 7,
	},
	secret: process.env.AUTH_SECRET,

	callbacks: {
		async signIn({ account, profile, user }) {
			if (account?.provider !== "github") return true;

			const githubProfile = profile as GithubProfile;
			if (!githubProfile?.email || !githubProfile.login || !githubProfile.id) {
				console.warn("GitHub profile missing required fields:", githubProfile);
				return false;
			}

			try {
				console.log("this is backend url", backendURL);
				const loginResponse = await retryApiCall(() =>
					circuitBreaker.call(() =>
						apiClient.post(`${backendURL}/users/login`, {
							githubId: githubProfile.id,
							email: githubProfile.email,
						})
					)
				);
				console.log("Login in successfull for user", loginResponse.data.user);
				user.id = loginResponse.data.user.id;
				user.token = loginResponse.data.token;
				user.plan = loginResponse.data.user.planName;
			} catch (error: any) {
				console.error(`Login failed for user: ${githubProfile.email}`, error);

				if (
					error.response &&
					(error.response.status === 404 || error.response.status === 400)
				) {
					try {
						console.log(
							`Attempting to register user: ${githubProfile.email}`,
							backendURL
						);

						const signUpResponse = await retryApiCall(() =>
							circuitBreaker.call(() =>
								apiClient.post(`${backendURL}/users/register`, {
									githubId: githubProfile.id,
									email: githubProfile.email,
									username: githubProfile.login,
									image: githubProfile.avatar_url,
								})
							)
						);

						console.log(
							`Registration successful for user: ${signUpResponse.data.user}`
						);
						user.id = signUpResponse.data.user.id;
						user.token = signUpResponse.data.token;
						user.plan = signUpResponse.data.user.planName;
					} catch (registerError: any) {
						console.error(
							`Registration failed for user: ${githubProfile.email}`,
							registerError.message || registerError
						);
						return false;
					}
				} else {
					return false;
				}
			}
			return true;
		},

		async jwt({ token, account, user, profile, trigger, session }) {
			if (trigger === "update" && session.user) {
				console.log("thisis callled after plan is update");
				console.log("this is token and session", token);
				return { ...token, ...session };
			}
			if (account && profile) {
				const githubProfile = profile as GithubProfile;
				token.id = user.id;
				token.email = githubProfile.email;
				token.name = githubProfile.login;
				token.picture = githubProfile.avatar_url;
				if (user?.token) {
					token.accessToken = user.token;
				}
				if (user.plan) {
					token.plan = user.plan;
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
				session.user.token = token.accessToken as string;
			}
			if (token.accessToken) {
				(session as any).accessToken = token.accessToken as string;
			}
			if (token.plan) {
				(session as any).user.plan = token.plan;
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
