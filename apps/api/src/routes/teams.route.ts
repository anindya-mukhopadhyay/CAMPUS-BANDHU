import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import * as teamsController from "../controllers/teams.controller";

export const teamsRouter = Router();

teamsRouter.get(
  "/",
  requireAuth,
  asyncHandler(teamsController.getTeams)
);

teamsRouter.post(
  "/",
  requireAuth,
  asyncHandler(teamsController.createTeam)
);

teamsRouter.post(
  "/:id/request",
  requireAuth,
  asyncHandler(teamsController.requestToJoin)
);

teamsRouter.post(
  "/:id/accept",
  requireAuth,
  asyncHandler(teamsController.acceptRequest)
);

teamsRouter.post(
  "/:id/reject",
  requireAuth,
  asyncHandler(teamsController.rejectRequest)
);
