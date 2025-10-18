import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getAllPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/payment.controller";

const router = Router();

router.route("/payments")
  .get(authMiddleware, getAllPayments)
  .post(authMiddleware, createPayment);
router.route("/payment/:paymentId")
  .get(authMiddleware, getPayment)
  .put(authMiddleware, updatePayment)
  .delete(authMiddleware, deletePayment);

export default router;