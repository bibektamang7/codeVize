import type { NextFunction, Request, Response } from "express";
import { verifyJWTToken } from "jwt";
import { prisma } from "db/prisma";
import { ApiError } from "../utils/apiErrorHandler";

interface DecodedToken {
	id: string;
}

export const adminMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const token =
			req.headers.authorization?.split("Bearer ")[1] ||
			req.cookies?.codevize_access_token;
		if (!token || token === "undefined") {
			throw new ApiError(401, "Authorization token required");
		}

		const tokenDecoded = verifyJWTToken(token);

		if (!tokenDecoded) {
			throw new ApiError(401, "Invalid or expired token");
		}

		const user = await prisma.user.findUnique({
			where: {
				id: (tokenDecoded as DecodedToken).id,
			},
			select: {
				id: true,
				planName: true,
				activeRepos: true,
				plan: true,
				role: true,
			},
		});

		if (!user) {
			throw new ApiError(401, "User not found");
		}

		// For now, we'll consider any user with enterprise plan as admin
		// In a real application, you might want to have an explicit 'isAdmin' field
		// or a different role system
		if (user.role !== "ADMIN") {
			throw new ApiError(403, "Access denied. Admin privileges required.");
		}

		req.user = user;
		next();
	} catch (error: any) {
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(401, "Unauthorized access", [error.message]);
	}
};
