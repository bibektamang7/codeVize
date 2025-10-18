import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getRepoErrorLog = async (req: Request, res: Response) => {
  try {
    const { logId } = req.params;
    
    const repoErrorLog = await prisma.repoErrorLog.findUnique({
      where: {
        id: logId,
      }
    });

    if (!repoErrorLog) {
      return res.status(404).json({ message: "Error log not found" });
    }

    res.status(200).json({ repoErrorLog });
  } catch (error) {
    console.error("Failed to retrieve error log", error);
    res.status(500).json({ message: "Failed to retrieve error log" });
  }
};

export const getAllRepoErrorLogs = async (req: Request, res: Response) => {
  try {
    const { repoConfigId, type, resolved } = req.query;
    
    const whereClause: any = {};
    if (repoConfigId) {
      whereClause.repoConfigId = String(repoConfigId);
    }
    if (type) {
      whereClause.type = String(type);
    }
    if (resolved !== undefined) {
      whereClause.resolved = resolved === 'true';
    }
    
    const repoErrorLogs = await prisma.repoErrorLog.findMany({
      where: whereClause,
      orderBy: {
        occurredAt: 'desc'
      }
    });

    res.status(200).json({ repoErrorLogs });
  } catch (error) {
    console.error("Failed to retrieve error logs", error);
    res.status(500).json({ message: "Failed to retrieve error logs" });
  }
};

export const createRepoErrorLog = async (req: Request, res: Response) => {
  try {
    const { repoConfigId, message, type, number } = req.body;

    const newRepoErrorLog = await prisma.repoErrorLog.create({
      data: {
        repoConfigId,
        message,
        type,
        number
      }
    });

    res.status(201).json({ repoErrorLog: newRepoErrorLog });
  } catch (error) {
    console.error("Failed to create error log", error);
    res.status(500).json({ message: "Failed to create error log" });
  }
};

export const updateRepoErrorLog = async (req: Request, res: Response) => {
  try {
    const { logId } = req.params;
    const { message, resolved } = req.body;

    const updatedRepoErrorLog = await prisma.repoErrorLog.update({
      where: {
        id: logId,
      },
      data: {
        ...(message && { message }),
        ...(resolved !== undefined && { resolved }),
      },
    });

    res.status(200).json({ repoErrorLog: updatedRepoErrorLog });
  } catch (error) {
    console.error("Failed to update error log", error);
    res.status(500).json({ message: "Failed to update error log" });
  }
};

export const deleteRepoErrorLog = async (req: Request, res: Response) => {
  try {
    const { logId } = req.params;
    
    await prisma.repoErrorLog.delete({
      where: {
        id: logId,
      },
    });

    res.status(200).json({ message: "Error log deleted successfully" });
  } catch (error) {
    console.error("Failed to delete error log", error);
    res.status(500).json({ message: "Failed to delete error log" });
  }
};

export const resolveRepoErrorLog = async (req: Request, res: Response) => {
  try {
    const { logId } = req.params;
    
    const updatedRepoErrorLog = await prisma.repoErrorLog.update({
      where: {
        id: logId,
      },
      data: {
        resolved: true
      },
    });

    res.status(200).json({ repoErrorLog: updatedRepoErrorLog });
  } catch (error) {
    console.error("Failed to resolve error log", error);
    res.status(500).json({ message: "Failed to resolve error log" });
  }
};