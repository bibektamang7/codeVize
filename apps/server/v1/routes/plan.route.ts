import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	// getAllPlans,
	// getPlan,
	// createPlan,
	updatePlan,
	deletePlan,
} from "../controllers/plan.controller";

const router = Router();
router.use(authMiddleware);

// router.route("/plans").get(getAllPlans).post(createPlan);
router.route("/plan/:planId").put(updatePlan).delete(deletePlan);
// .get(getPlan);

export default router;
