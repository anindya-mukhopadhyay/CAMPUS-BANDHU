import { Router } from "express";

import { asyncHandler } from "../utils/async-handler";
import { apiOk } from "../utils/api-response";
import { emitRealtime } from "../utils/socket";
import { requireAuth } from "../middleware/auth";
import { listAchievements, mintAchievement } from "../services/achievements.service";

export const achievementsRouter = Router();

achievementsRouter.get(
  "/achievements/student/:studentId",
  requireAuth,
  asyncHandler(async (request, response) => {
    const studentId = String(request.params.studentId ?? "");
    const data = await listAchievements(studentId);
    response.json(apiOk(data));
  })
);

achievementsRouter.post(
  "/achievements/mint",
  requireAuth,
  asyncHandler(async (request, response) => {
    const data = await mintAchievement(request.body);
    emitRealtime(request, "achievements:minted", data);
    response.status(201).json(apiOk(data));
  })
);
