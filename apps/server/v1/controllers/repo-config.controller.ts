import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getRepoConfig = async (req: Request, res: Response) => {
  try {
    const { repoId } = req.params;
    
    const repoConfig = await prisma.repoConfig.findUnique({
      where: {
        repoId: repoId,
      },
      include: {
        generalConfig: true,
        reviewConfig: {
          include: {
            pathConfigs: true,
            labelConfigs: true
          }
        }
      }
    });

    if (!repoConfig) {
      return res.status(404).json({ message: "Repo config not found" });
    }

    res.status(200).json({ repoConfig });
  } catch (error) {
    console.error("Failed to retrieve repo config", error);
    res.status(500).json({ message: "Failed to retrieve repo config" });
  }
};

export const createRepoConfig = async (req: Request, res: Response) => {
  try {
    const { repoId } = req.params;
    
    // Create associated configs first
    const generalConfig = await prisma.generalConfig.create({
      data: {}
    });
    
    const reviewConfig = await prisma.reviewConfig.create({
      data: {}
    });

    const newRepoConfig = await prisma.repoConfig.create({
      data: {
        repoId,
        generalConfigId: generalConfig.id,
        reviewConfigId: reviewConfig.id
      },
      include: {
        generalConfig: true,
        reviewConfig: true
      }
    });

    res.status(201).json({ repoConfig: newRepoConfig });
  } catch (error) {
    console.error("Failed to create repo config", error);
    res.status(500).json({ message: "Failed to create repo config" });
  }
};

export const updateRepoConfig = async (req: Request, res: Response) => {
  try {
    const { repoId } = req.params;
    const { generalConfig, reviewConfig } = req.body;

    const repoConfig = await prisma.repoConfig.findUnique({
      where: { repoId }
    });

    if (!repoConfig) {
      return res.status(404).json({ message: "Repo config not found" });
    }

    // Update general config if provided
    if (generalConfig) {
      await prisma.generalConfig.update({
        where: { id: repoConfig.generalConfigId },
        data: generalConfig
      });
    }

    // Update review config if provided
    if (reviewConfig) {
      await prisma.reviewConfig.update({
        where: { id: repoConfig.reviewConfigId },
        data: reviewConfig
      });
    }

    const updatedRepoConfig = await prisma.repoConfig.findUnique({
      where: { repoId },
      include: {
        generalConfig: true,
        reviewConfig: {
          include: {
            pathConfigs: true,
            labelConfigs: true
          }
        }
      }
    });

    res.status(200).json({ repoConfig: updatedRepoConfig });
  } catch (error) {
    console.error("Failed to update repo config", error);
    res.status(500).json({ message: "Failed to update repo config" });
  }
};

export const deleteRepoConfig = async (req: Request, res: Response) => {
  try {
    const { repoId } = req.params;
    
    // Get the repo config to access related config IDs
    const repoConfig = await prisma.repoConfig.findUnique({
      where: { repoId }
    });

    if (!repoConfig) {
      return res.status(404).json({ message: "Repo config not found" });
    }

    // Delete related configs first
    await prisma.generalConfig.delete({
      where: { id: repoConfig.generalConfigId }
    });

    await prisma.reviewConfig.delete({
      where: { id: repoConfig.reviewConfigId }
    });

    // Then delete the repo config
    await prisma.repoConfig.delete({
      where: { repoId },
    });

    res.status(200).json({ message: "Repo config deleted successfully" });
  } catch (error) {
    console.error("Failed to delete repo config", error);
    res.status(500).json({ message: "Failed to delete repo config" });
  }
};