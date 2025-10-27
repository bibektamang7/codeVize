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
router.use(authMiddleware);

router.route("/payments").get(getAllPayments).post(createPayment);
router
	.route("/payment/:paymentId")
	.get(getPayment)
	.put(updatePayment)
	.delete(deletePayment);

export default router;
