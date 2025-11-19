import type { NextFunction, Request, Response } from "express";
import { verifyJWTToken } from "jwt";
import { prisma } from "db/prisma";
import { ApiError } from "../utils/apiErrorHandler";

interface DecodedToken {
	id: string;
}

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const token =
			req.headers.authorization?.split("Bearer ")[1] ||
			req.cookies?.codevize_access_token;

		if (!token) {
			return;
		}
		const tokenDecoded = verifyJWTToken(token);
		const user = await hasUser(tokenDecoded as DecodedToken);
		if (!user) {
			res.status(403).json({ message: "User not found!" });
			return;
		}
		req.user = user;
		next();
	} catch (error: any) {
		throw new ApiError(401, "Unauthorized access", [error.message]);
	}
};

const hasUser = async (decodedToken: DecodedToken) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: decodedToken.id },
			select: {
				id: true,
				planName: true,
				activeRepos: true,
				plan: true,
			},
		});

		if (!user) {
			return null;
		}
		return user;
	} catch (error) {
		console.error("Failed to find user", error);
		return null;
	}
};
