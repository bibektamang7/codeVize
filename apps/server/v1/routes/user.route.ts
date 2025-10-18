import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

const router = Router();

router.route("/user")
  .get(authMiddleware, getUser)
  .put(authMiddleware, updateUser)
  .delete(authMiddleware, deleteUser);

export default router;