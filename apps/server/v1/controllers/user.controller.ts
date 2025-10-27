import type { Request, Response } from "express";
import { prisma } from "db/prisma";
import { ApiError, asyncHandler } from "../utils/apiErrorHandler";

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    include: {
      repos: true,
      plan: true,
      payments: true
    }
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