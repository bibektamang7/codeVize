import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getReviewConfig,
  createReviewConfig,
  updateReviewConfig,
  deleteReviewConfig,
} from "../controllers/review-config.controller";

const router = Router();

router.route("/review-config/:configId")
  .get(authMiddleware, getReviewConfig)
  .post(authMiddleware, createReviewConfig)
  .put(authMiddleware, updateReviewConfig)
  .delete(authMiddleware, deleteReviewConfig);

export default router;