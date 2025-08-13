import { Router } from "express";
import {
	deleteInstalledRepo,
	installRepository,
	uninstallRepository,
} from "../controllers/github.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.route("/installation/:repoId").post(authMiddleware, installRepository);
router
	.route("/uninstallation/:repoId")
	.patch(authMiddleware, uninstallRepository);
router
	.route("/installation/:repoId")
	.delete(authMiddleware, deleteInstalledRepo);

export default router;
