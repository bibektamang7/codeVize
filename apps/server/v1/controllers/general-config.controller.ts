import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getGeneralConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    
    const generalConfig = await prisma.generalConfig.findUnique({
      where: {
        id: configId,
      }
    });

    if (!generalConfig) {
      return res.status(404).json({ message: "General config not found" });
    }

    res.status(200).json({ generalConfig });
  } catch (error) {
    console.error("Failed to retrieve general config", error);
    res.status(500).json({ message: "Failed to retrieve general config" });
  }
};

export const createGeneralConfig = async (req: Request, res: Response) => {
  try {
    const { tone, enableFreeTier, earlyAccess, defaultModel, contextDepth, issueEnabled } = req.body;

    const newGeneralConfig = await prisma.generalConfig.create({
      data: {
        tone: tone || 'professional',
        enableFreeTier: enableFreeTier !== undefined ? enableFreeTier : true,
        earlyAccess: earlyAccess !== undefined ? earlyAccess : false,
        defaultModel,
        contextDepth,
        issueEnabled: issueEnabled !== undefined ? issueEnabled : true
      }
    });

    res.status(201).json({ generalConfig: newGeneralConfig });
  } catch (error) {
    console.error("Failed to create general config", error);
    res.status(500).json({ message: "Failed to create general config" });
  }
};

export const updateGeneralConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    const { tone, enableFreeTier, earlyAccess, defaultModel, contextDepth, issueEnabled } = req.body;

    const updatedGeneralConfig = await prisma.generalConfig.update({
      where: {
        id: configId,
      },
      data: {
        ...(tone !== undefined && { tone }),
        ...(enableFreeTier !== undefined && { enableFreeTier }),
        ...(earlyAccess !== undefined && { earlyAccess }),
        ...(defaultModel !== undefined && { defaultModel }),
        ...(contextDepth !== undefined && { contextDepth }),
        ...(issueEnabled !== undefined && { issueEnabled }),
      },
    });

    res.status(200).json({ generalConfig: updatedGeneralConfig });
  } catch (error) {
    console.error("Failed to update general config", error);
    res.status(500).json({ message: "Failed to update general config" });
  }
};

export const deleteGeneralConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    
    await prisma.generalConfig.delete({
      where: {
        id: configId,
      },
    });

    res.status(200).json({ message: "General config deleted successfully" });
  } catch (error) {
    console.error("Failed to delete general config", error);
    res.status(500).json({ message: "Failed to delete general config" });
  }
};