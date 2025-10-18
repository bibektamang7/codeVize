import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getPathConfig,
  getAllPathConfigs,
  createPathConfig,
  updatePathConfig,
  deletePathConfig,
} from "../controllers/path-config.controller";

const router = Router();

router.route("/path-configs")
  .get(authMiddleware, getAllPathConfigs)
  .post(authMiddleware, createPathConfig);
router.route("/path-config/:configId")
  .get(authMiddleware, getPathConfig)
  .put(authMiddleware, updatePathConfig)
  .delete(authMiddleware, deletePathConfig);

export default router;