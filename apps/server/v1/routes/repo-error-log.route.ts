import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getRepoErrorLog,
  getAllRepoErrorLogs,
  createRepoErrorLog,
  updateRepoErrorLog,
  deleteRepoErrorLog,
  resolveRepoErrorLog,
} from "../controllers/repo-error-log.controller";

const router = Router();

router.route("/repo-error-logs")
  .get(authMiddleware, getAllRepoErrorLogs)
  .post(authMiddleware, createRepoErrorLog);
router.route("/repo-error-log/:logId")
  .get(authMiddleware, getRepoErrorLog)
  .put(authMiddleware, updateRepoErrorLog)
  .delete(authMiddleware, deleteRepoErrorLog);
router.route("/repo-error-log/:logId/resolve")
  .post(authMiddleware, resolveRepoErrorLog);

export default router;