import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getReviewConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    
    const reviewConfig = await prisma.reviewConfig.findUnique({
      where: {
        id: configId,
      },
      include: {
        pathConfigs: true,
        labelConfigs: true
      }
    });

    if (!reviewConfig) {
      return res.status(404).json({ message: "Review config not found" });
    }

    res.status(200).json({ reviewConfig });
  } catch (error) {
    console.error("Failed to retrieve review config", error);
    res.status(500).json({ message: "Failed to retrieve review config" });
  }
};

export const createReviewConfig = async (req: Request, res: Response) => {
  try {
    const { 
      aiReviewEnabled, 
      highLevelSummaryEnabled, 
      showWalkThrough, 
      abortOnClose, 
      isProgressFortuneEnabled, 
      poemEnabled 
    } = req.body;

    const newReviewConfig = await prisma.reviewConfig.create({
      data: {
        aiReviewEnabled: aiReviewEnabled !== undefined ? aiReviewEnabled : false,
        highLevelSummaryEnabled: highLevelSummaryEnabled !== undefined ? highLevelSummaryEnabled : true,
        showWalkThrough: showWalkThrough !== undefined ? showWalkThrough : true,
        abortOnClose: abortOnClose !== undefined ? abortOnClose : true,
        isProgressFortuneEnabled: isProgressFortuneEnabled !== undefined ? isProgressFortuneEnabled : false,
        poemEnabled: poemEnabled !== undefined ? poemEnabled : false
      }
    });

    res.status(201).json({ reviewConfig: newReviewConfig });
  } catch (error) {
    console.error("Failed to create review config", error);
    res.status(500).json({ message: "Failed to create review config" });
  }
};

export const updateReviewConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    const { 
      aiReviewEnabled, 
      highLevelSummaryEnabled, 
      showWalkThrough, 
      abortOnClose, 
      isProgressFortuneEnabled, 
      poemEnabled 
    } = req.body;

    const updatedReviewConfig = await prisma.reviewConfig.update({
      where: {
        id: configId,
      },
      data: {
        ...(aiReviewEnabled !== undefined && { aiReviewEnabled }),
        ...(highLevelSummaryEnabled !== undefined && { highLevelSummaryEnabled }),
        ...(showWalkThrough !== undefined && { showWalkThrough }),
        ...(abortOnClose !== undefined && { abortOnClose }),
        ...(isProgressFortuneEnabled !== undefined && { isProgressFortuneEnabled }),
        ...(poemEnabled !== undefined && { poemEnabled }),
      },
    });

    res.status(200).json({ reviewConfig: updatedReviewConfig });
  } catch (error) {
    console.error("Failed to update review config", error);
    res.status(500).json({ message: "Failed to update review config" });
  }
};

export const deleteReviewConfig = async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    
    // First delete associated path and label configs
    await prisma.pathConfig.deleteMany({
      where: {
        reviewConfigId: configId
      }
    });

    await prisma.labelConfig.deleteMany({
      where: {
        reviewConfigId: configId
      }
    });

    await prisma.reviewConfig.delete({
      where: {
        id: configId,
      },
    });

    res.status(200).json({ message: "Review config deleted successfully" });
  } catch (error) {
    console.error("Failed to delete review config", error);
    res.status(500).json({ message: "Failed to delete review config" });
  }
};