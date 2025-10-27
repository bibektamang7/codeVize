import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	getUser,
	updateUser,
	deleteUser,
} from "../controllers/user.controller";

const router = Router();
router.use(authMiddleware);

router.route("/user").get(getUser).put(updateUser).delete(deleteUser);
router.route("/:userId/plan").post();

export default router;
