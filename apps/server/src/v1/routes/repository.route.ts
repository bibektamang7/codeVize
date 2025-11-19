import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	getAllRepositories,
	getRepository,
	deactivateRepository,
	activateRepository,
	updateRepoConfig,
getRepositoriesLogs
} from "../controllers/repository.controller";

const router = Router();
router.use(authMiddleware);

router.route("/repository/:repoId").get(getRepository).patch(updateRepoConfig);
router.route("/repository/:repoId/activate").post(activateRepository);
router.route("/repository/:repoId/deactivate").post(deactivateRepository);
router.route("/").get(getAllRepositories);
router.route("/repositories-logs").get(getRepositoriesLogs)

export default router;
