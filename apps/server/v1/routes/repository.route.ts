import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	getAllRepositories,
	getRepository,
	deactivateRepository,
	activateRepository,
	deleteInstalledRepo,
} from "../controllers/repository.controller";

const router = Router();

router.route("/repository/:repoId")
  .get(authMiddleware, getRepository)
  .delete(authMiddleware, deleteInstalledRepo);
router.route("/repositories")
  .get(authMiddleware, getAllRepositories);
router.route("/repository/:repoId/activate")
  .post(authMiddleware, activateRepository);
router.route("/repository/:repoId/deactivate")
  .post(authMiddleware, deactivateRepository);

export default router;
