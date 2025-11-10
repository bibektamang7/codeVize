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
	if (!isPublicPath && !isRootPath && !session) {
		return NextResponse.redirect(new URL("/login", req.url));
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
