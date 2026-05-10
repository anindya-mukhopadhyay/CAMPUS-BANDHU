import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import { apiOk } from "../lib/api-response";
import { requireAuth } from "../middleware/auth";
import { addSkill, getProfileById, updateProfile } from "../services/profiles.service";

export const profilesRouter = Router();

profilesRouter.get(
  "/profiles/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    const userId = request.user?.uid ?? "anonymous";
    const data = await getProfileById(userId);
    response.json(apiOk(data));
  })
);

profilesRouter.put(
  "/profiles/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    const userId = request.user?.uid ?? "anonymous";
    const data = await updateProfile(userId, request.body);
    response.json(apiOk(data));
  })
);

profilesRouter.post(
  "/profiles/me/skills",
  requireAuth,
  asyncHandler(async (request, response) => {
    const userId = request.user?.uid ?? "anonymous";
    const skill = String(request.body.skill ?? "").trim();
    const data = await addSkill(userId, skill);
    response.json(apiOk(data));
  })
);

profilesRouter.get(
  "/profiles/:id",
  asyncHandler(async (request, response) => {
    const userId = String(request.params.id ?? "");
    const data = await getProfileById(userId);
    response.json(apiOk(data));
  })
);
