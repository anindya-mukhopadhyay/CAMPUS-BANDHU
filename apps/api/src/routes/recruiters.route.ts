import { Router } from "express";

import { asyncHandler } from "../utils/async-handler";
import { apiOk } from "../utils/api-response";
import { emitRealtime } from "../utils/socket";
import { requireAuth } from "../middleware/auth";
import { createOpportunity, listOpportunities } from "../services/recruiters.service";

export const recruitersRouter = Router();

recruitersRouter.get(
  "/recruiters/opportunities",
  asyncHandler(async (_request, response) => {
    const data = await listOpportunities();
    response.json(apiOk(data));
  })
);

recruitersRouter.post(
  "/recruiters/opportunities",
  requireAuth,
  asyncHandler(async (request, response) => {
    const recruiterId = request.user?.uid ?? "anonymous";
    const data = await createOpportunity(request.body, recruiterId);
    emitRealtime(request, "recruiters:new_opportunity", data);
    response.status(201).json(apiOk(data));
  })
);
