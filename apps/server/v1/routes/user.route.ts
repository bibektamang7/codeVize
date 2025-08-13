import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	getAllRepositories,
	getRepository,
} from "../controllers/user.controller";

const router = Router();

router.route("/repository/:repoId").get(authMiddleware, getRepository);
router.route("/repositories").get(authMiddleware, getAllRepositories);

export default router;
