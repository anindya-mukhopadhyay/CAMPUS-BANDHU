import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import { apiOk } from "../lib/api-response";
import { requireAuth } from "../middleware/auth";
import { getPersonalizedRecommendations } from "../services/recommendations.service";

export const recommendationsRouter = Router();

recommendationsRouter.post(
  "/recommendations/personalized",
  requireAuth,
  asyncHandler(async (request, response) => {
    const interests = Array.isArray(request.body.interests)
      ? request.body.interests.map((item: unknown) => String(item))
      : [];

    const data = await getPersonalizedRecommendations({
      userId: request.user?.uid ?? "anonymous",
      interests
    });

    response.json(apiOk(data));
  })
);
