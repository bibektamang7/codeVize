import { NextRequest, NextResponse } from "next/server";
import { auth } from "./app/api/auth/[...nextauth]/auth";

export default async function middleware(req: NextRequest) {
	const session = await auth();
	const path = req.nextUrl.pathname;

	const isPublicPath = path === "/login" || path === "/signup";
	const isRootPath = path === "/";

	if (isPublicPath && session) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	const isDashboardRoute = path.startsWith("/dashboard");
	const isAdminRoute = path.startsWith("/admin");

	if ((isDashboardRoute || isAdminRoute) && !session) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	if (isAdminRoute && session && session.user?.role !== "ADMIN") {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	if (isRootPath) {
		if (session) {
			return NextResponse.redirect(new URL("/dashboard", req.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/login", "/signup", "/dashboard/:path*", "/admin/:path*"],
};
