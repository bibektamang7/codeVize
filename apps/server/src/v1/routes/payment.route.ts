import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	getAllPayments,
	getPayment,
	createPayment,
	updatePayment,
	deletePayment,
	paymentCallback,
} from "../controllers/payment.controller";

const router = Router();

router.route("/payment/callback").patch(paymentCallback);
router.use(authMiddleware);

router.route("/").get(getAllPayments).post(createPayment);
router
	.route("/payment/:paymentId")
	.get(getPayment)
	.put(updatePayment)
	.delete(deletePayment);

export default router;
