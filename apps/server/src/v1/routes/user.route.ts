import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
	getUser,
	updateUser,
	deleteUser,
	loginUser,
	registerUser,
} from "../controllers/user.controller";

const router = Router();

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);

router.use(authMiddleware);
router.route("/user").get(getUser).put(updateUser).delete(deleteUser);
// router.route("/:userId/plan").post();

export default router;
