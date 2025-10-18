import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getGeneralConfig,
  createGeneralConfig,
  updateGeneralConfig,
  deleteGeneralConfig,
} from "../controllers/general-config.controller";

const router = Router();

router.route("/general-config/:configId")
  .get(authMiddleware, getGeneralConfig)
  .post(authMiddleware, createGeneralConfig)
  .put(authMiddleware, updateGeneralConfig)
  .delete(authMiddleware, deleteGeneralConfig);

export default router;