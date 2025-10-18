import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getLabelConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    
    const labelConfig = await prisma.labelConfig.findUnique({
      where: {
        id: configId,
      }
    });

    if (!labelConfig) {
      return res.status(404).json({ message: "Label config not found" });
    }

    res.status(200).json({ labelConfig });
  } catch (error) {
    console.error("Failed to retrieve label config", error);
    res.status(500).json({ message: "Failed to retrieve label config" });
  }
};

export const getAllLabelConfigs = async (req: Request, res: Response) => {
  try {
    const { reviewConfigId } = req.query;
    
    const whereClause: any = {};
    if (reviewConfigId) {
      whereClause.reviewConfigId = String(reviewConfigId);
    }
    
    const labelConfigs = await prisma.labelConfig.findMany({
      where: whereClause
    });

    res.status(200).json({ labelConfigs });
  } catch (error) {
    console.error("Failed to retrieve label configs", error);
    res.status(500).json({ message: "Failed to retrieve label configs" });
  }
};

export const createLabelConfig = async (req: Request, res: Response) => {
  try {
    const { label, instructions, enabled, reviewConfigId } = req.body;

    const newLabelConfig = await prisma.labelConfig.create({
      data: {
        label,
        instructions,
        enabled: enabled !== undefined ? enabled : true,
        reviewConfigId
      }
    });

    res.status(201).json({ labelConfig: newLabelConfig });
  } catch (error) {
    console.error("Failed to create label config", error);
    res.status(500).json({ message: "Failed to create label config" });
  }
};

export const updateLabelConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    const { label, instructions, enabled } = req.body;

    const updatedLabelConfig = await prisma.labelConfig.update({
      where: {
        id: configId,
      },
      data: {
        ...(label && { label }),
        ...(instructions && { instructions }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    res.status(200).json({ labelConfig: updatedLabelConfig });
  } catch (error) {
    console.error("Failed to update label config", error);
    res.status(500).json({ message: "Failed to update label config" });
  }
};

export const deleteLabelConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    
    await prisma.labelConfig.delete({
      where: {
        id: configId,
      },
    });

    res.status(200).json({ message: "Label config deleted successfully" });
  } catch (error) {
    console.error("Failed to delete label config", error);
    res.status(500).json({ message: "Failed to delete label config" });
  }
};