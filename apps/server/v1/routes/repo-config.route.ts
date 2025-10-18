import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getRepoConfig,
  createRepoConfig,
  updateRepoConfig,
  deleteRepoConfig,
} from "../controllers/repo-config.controller";

const router = Router();

router.route("/repo-config/:repoId")
  .get(authMiddleware, getRepoConfig)
  .post(authMiddleware, createRepoConfig)
  .put(authMiddleware, updateRepoConfig)
  .delete(authMiddleware, deleteRepoConfig);

export default router;