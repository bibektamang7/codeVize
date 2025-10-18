import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getPathConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    
    const pathConfig = await prisma.pathConfig.findUnique({
      where: {
        id: configId,
      }
    });

    if (!pathConfig) {
      return res.status(404).json({ message: "Path config not found" });
    }

    res.status(200).json({ pathConfig });
  } catch (error) {
    console.error("Failed to retrieve path config", error);
    res.status(500).json({ message: "Failed to retrieve path config" });
  }
};

export const getAllPathConfigs = async (req: Request, res: Response) => {
  try {
    const { reviewConfigId } = req.query;
    
    const whereClause: any = {};
    if (reviewConfigId) {
      whereClause.reviewConfigId = String(reviewConfigId);
    }
    
    const pathConfigs = await prisma.pathConfig.findMany({
      where: whereClause
    });

    res.status(200).json({ pathConfigs });
  } catch (error) {
    console.error("Failed to retrieve path configs", error);
    res.status(500).json({ message: "Failed to retrieve path configs" });
  }
};

export const createPathConfig = async (req: Request, res: Response) => {
  try {
    const { importance, pathPattern, instructions, enabled, reviewConfigId } = req.body;

    const newPathConfig = await prisma.pathConfig.create({
      data: {
        importance,
        pathPattern,
        instructions,
        enabled: enabled !== undefined ? enabled : true,
        reviewConfigId
      }
    });

    res.status(201).json({ pathConfig: newPathConfig });
  } catch (error) {
    console.error("Failed to create path config", error);
    res.status(500).json({ message: "Failed to create path config" });
  }
};

export const updatePathConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    const { importance, pathPattern, instructions, enabled } = req.body;

    const updatedPathConfig = await prisma.pathConfig.update({
      where: {
        id: configId,
      },
      data: {
        ...(importance !== undefined && { importance }),
        ...(pathPattern && { pathPattern }),
        ...(instructions && { instructions }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    res.status(200).json({ pathConfig: updatedPathConfig });
  } catch (error) {
    console.error("Failed to update path config", error);
    res.status(500).json({ message: "Failed to update path config" });
  }
};

export const deletePathConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    
    await prisma.pathConfig.delete({
      where: {
        id: configId,
      },
    });

    res.status(200).json({ message: "Path config deleted successfully" });
  } catch (error) {
    console.error("Failed to delete path config", error);
    res.status(500).json({ message: "Failed to delete path config" });
  }
};