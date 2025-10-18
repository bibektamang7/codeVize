import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        users: true
      }
    });

    res.status(200).json({ plans });
  } catch (error) {
    console.error("Failed to retrieve plans", error);
    res.status(500).json({ message: "Failed to retrieve plans" });
  }
};

export const getPlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    
    const plan = await prisma.plan.findUnique({
      where: {
        id: planId,
      },
      include: {
        users: true
      }
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ plan });
  } catch (error) {
    console.error("Failed to retrieve plan", error);
    res.status(500).json({ message: "Failed to retrieve plan" });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  try {
    const { name, price, maxRepos, description } = req.body;

    const newPlan = await prisma.plan.create({
      data: {
        name,
        price,
        maxRepos,
        description
      }
    });

    res.status(201).json({ plan: newPlan });
  } catch (error) {
    console.error("Failed to create plan", error);
    res.status(500).json({ message: "Failed to create plan" });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const { name, price, maxRepos, description } = req.body;

    const updatedPlan = await prisma.plan.update({
      where: {
        id: planId,
      },
      data: {
        ...(name && { name }),
        ...(price && { price }),
        ...(maxRepos && { maxRepos }),
        ...(description && { description }),
      },
    });

    res.status(200).json({ plan: updatedPlan });
  } catch (error) {
    console.error("Failed to update plan", error);
    res.status(500).json({ message: "Failed to update plan" });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    
    await prisma.plan.delete({
      where: {
        id: planId,
      },
    });

    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Failed to delete plan", error);
    res.status(500).json({ message: "Failed to delete plan" });
  }
};