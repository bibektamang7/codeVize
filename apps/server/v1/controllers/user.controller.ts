import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getUser = async (req: Request, res: Response) => {
  try {
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
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Failed to retrieve user", error);
    res.status(500).json({ message: "Failed to retrieve user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
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

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Failed to update user", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({
      where: {
        id: req.user.id,
      },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};