import type { Request, Response } from "express";
import { prisma } from "db/prisma";
import { ApiError, asyncHandler } from "../utils/apiErrorHandler";
import { createToken } from "jwt";

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
	console.log("is it here or not", req.body.email);
	const { githubId, email } = req.body;
	if (!githubId || !email) {
		throw new ApiError(400, "GithubId or email not provided");
	}
	const user = await prisma.user.findUnique({
		where: {
			githubId: String(githubId),
		},
	});
	console.log("this is user email");

	if (!user || user.email !== email) {
		throw new ApiError(400, "Invalid user credentials");
	}
	console.log("where are you ");
	const token = createToken(user.id);
	if (!token) {
		throw new ApiError(400, "Failed to create token, try again");
	}
	res.status(200).json({ user, token });
});
export const registerUser = asyncHandler(
	async (req: Request, res: Response) => {
		const { githubId, email, username, image } = req.body;
		if (!githubId || !email || !username || !image) {
			throw new ApiError(400, "Invalid creadentials");
		}
		const user = await prisma.user.findUnique({
			where: {
				githubId,
			},
		});
		if (user) {
			throw new ApiError(400, "User already exists");
		}
		const createdUser = await prisma.user.create({
			data: {
				email,
				githubId: String(githubId),
				username,
				image,
				planName: "FREE",
				plan: {
					connect: {
						name: "FREE",
					},
				},
			},
		});
		if (!createdUser) {
			throw new ApiError(400, "Failed to create user");
		}
		const token = createToken(createdUser.id);
		res.status(200).json({ user: createdUser, token });
		return;
	}
);

export const getUser = asyncHandler(async (req: Request, res: Response) => {
	const user = await prisma.user.findUnique({
		where: {
			id: req.user.id,
		},
		include: {
			repos: true,
			plan: true,
			payments: true,
		},
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	res.status(200).json({ success: true, user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
	const { username, email, image } = req.body;

	const updatedUser = await prisma.user.update({
		where: {
			id: req.user.id,
		},
		data: {
			...(username && { username }),
			...(email && { email }),
			...(image && { image }),
		},
	});

	res.status(200).json({ success: true, user: updatedUser });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
	await prisma.user.delete({
		where: {
			id: req.user.id,
		},
	});

	res.status(200).json({ success: true, message: "User deleted successfully" });
});
