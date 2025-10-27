import type { Request, Response } from "express";
import { prisma } from "db/prisma";
import { ApiError, asyncHandler } from "../utils/apiErrorHandler";

export const getAllPayments = asyncHandler(async (req: Request, res: Response) => {
  const payments = await prisma.payment.findMany({
    include: {
      user: true,
      plan: true
    }
  });

  res.status(200).json({ success: true, payments });
});

export const getPayment = asyncHandler(async (req: Request, res: Response) => {
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
    throw new ApiError(404, "Payment not found");
  }

  res.status(200).json({ success: true, payment });
});

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const { userId, status, amount, planId } = req.body;

  const newPayment = await prisma.payment.create({
    data: {
      userId,
      status,
      amount,
      planId
    }
  });

  res.status(201).json({ success: true, payment: newPayment });
});

export const updatePayment = asyncHandler(async (req: Request, res: Response) => {
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

  res.status(200).json({ success: true, payment: updatedPayment });
});

export const deletePayment = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  
  await prisma.payment.delete({
    where: {
      id: paymentId,
    },
  });

  res.status(200).json({ success: true, message: "Payment deleted successfully" });
});