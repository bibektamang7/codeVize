import { Router } from "express";
import { adminMiddleware } from "../middlewares/admin.middleware";
import {
	getAdminDashboardStats,
	getAllUsers,
	deleteUser,
	getAllRepositories,
	deleteRepository,
	getAllPayments,
} from "../controllers/admin.controller";

const router = Router();

router.use(adminMiddleware);

router.route("/dashboard/stats").get(getAdminDashboardStats);

router.route("/users").get(getAllUsers);
router.route("/users/:userId").delete(deleteUser);

router.route("/repositories").get(getAllRepositories);
router.route("/repositories/:repoId").delete(deleteRepository);
router.route("/repositories/:repoId/toggle-status");

router.route("/payments").get(getAllPayments);

export default router;
