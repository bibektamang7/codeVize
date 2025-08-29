import type { NextFunction, Request, Response } from "express";
import { verifyJWTToken } from "jwt";
import { prisma, prismaClient } from "db/prisma";

interface DecodedToken {
	id: string;
}

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
	console.log("token", token)
	const tokenDecoded = verifyJWTToken(token);
	const user = await hasUser(tokenDecoded as DecodedToken);
	if (!user) {
		res.status(403).json({ message: "Unauthorized Request" });
		return;
	}
	req.user = user;
	next();
};

const hasUser = async (decodedToken: DecodedToken) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: decodedToken.id },
			select: {
				id: true,
				plan: true,
				activeRepos: true,
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
