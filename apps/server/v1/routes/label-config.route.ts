import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getLabelConfig,
  getAllLabelConfigs,
  createLabelConfig,
  updateLabelConfig,
  deleteLabelConfig,
} from "../controllers/label-config.controller";

const router = Router();

router.route("/label-configs")
  .get(authMiddleware, getAllLabelConfigs)
  .post(authMiddleware, createLabelConfig);
router.route("/label-config/:configId")
  .get(authMiddleware, getLabelConfig)
  .put(authMiddleware, updateLabelConfig)
  .delete(authMiddleware, deleteLabelConfig);

export default router;