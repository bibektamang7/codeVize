import type { Request, Response } from "express";
import { prisma } from "db/prisma";

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: true,
        plan: true
      }
    });

    res.status(200).json({ payments });
  } catch (error) {
    console.error("Failed to retrieve payments", error);
    res.status(500).json({ message: "Failed to retrieve payments" });
  }
};

export const getPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        user: true,
        plan: true
      }
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ payment });
  } catch (error) {
    console.error("Failed to retrieve payment", error);
    res.status(500).json({ message: "Failed to retrieve payment" });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { userId, status, amount, planId } = req.body;

    const newPayment = await prisma.payment.create({
      data: {
        userId,
        status,
        amount,
        planId
      }
    });

    res.status(201).json({ payment: newPayment });
  } catch (error) {
    console.error("Failed to create payment", error);
    res.status(500).json({ message: "Failed to create payment" });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status, amount } = req.body;

    const updatedPayment = await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        ...(status && { status }),
        ...(amount && { amount }),
      },
    });

    res.status(200).json({ payment: updatedPayment });
  } catch (error) {
    console.error("Failed to update payment", error);
    res.status(500).json({ message: "Failed to update payment" });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    
    await prisma.payment.delete({
      where: {
        id: paymentId,
      },
    });

    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Failed to delete payment", error);
    res.status(500).json({ message: "Failed to delete payment" });
  }
};