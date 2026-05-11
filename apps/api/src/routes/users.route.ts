import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import * as usersController from "../controllers/users.controller";

export const usersRouter = Router();

usersRouter.get(
  "/me",
  requireAuth,
  asyncHandler(usersController.getProfile)
);

usersRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(usersController.updateProfile)
);

usersRouter.post(
  "/me/skills",
  requireAuth,
  asyncHandler(usersController.addSkill)
);

usersRouter.get(
  "/:id",
  asyncHandler(usersController.getProfile)
);

