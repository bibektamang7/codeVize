import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/plan.controller";

const router = Router();

router.route("/plans")
  .get(authMiddleware, getAllPlans)
  .post(authMiddleware, createPlan);
router.route("/plan/:planId")
  .get(authMiddleware, getPlan)
  .put(authMiddleware, updatePlan)
  .delete(authMiddleware, deletePlan);

export default router;