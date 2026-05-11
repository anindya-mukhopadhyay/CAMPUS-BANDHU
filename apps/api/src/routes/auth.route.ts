import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth, requireRole } from "../middleware/auth";
import * as authController from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post(
  "/signup",
  asyncHandler(authController.signup)
);

authRouter.post(
  "/login",
  requireAuth,
  asyncHandler(authController.login)
);

authRouter.get(
  "/verify-role",
  requireAuth,
  requireRole("student", "college_admin", "super_admin"),
  asyncHandler(authController.verifyRole)
);
