import type { NextFunction, Request, Response } from "express";
import { verifyJWTToken } from "jwt";
import { prismaClient } from "db/prisma";
import type { User } from "../global";

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token =
		req.headers.authorization?.split("Bearer ")[1] ||
		req.cookies?.codevize_access_token;

	if (!token) {
		return;
	}
	const tokenDecoded = verifyJWTToken(token);
	const user = await hasUser(tokenDecoded as User);
	if (!user) {
		res.status(403).json({ message: "Unauthorized Request" });
		return;
	}
	req.user = user;
	next();
};

const hasUser = async (user: User) => {
	try {
		// const user = prismaClient.user.findUnique({
		// 	where: {
		// 		id: user.id,
		// 	},
		// });

		// if (!user) {
		// 	return null;
		// }
		// return user;
		return null;
	} catch (error) {
		console.error("Failed to find user", error);
		return null;
	}
};
