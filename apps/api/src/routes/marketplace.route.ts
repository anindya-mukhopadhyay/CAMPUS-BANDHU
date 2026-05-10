import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import { apiOk } from "../lib/api-response";
import { emitRealtime } from "../lib/socket";
import { requireAuth } from "../middleware/auth";
import { createListing, listMarketplace, markListingSold } from "../services/marketplace.service";

export const marketplaceRouter = Router();

marketplaceRouter.get(
  "/marketplace",
  asyncHandler(async (_request, response) => {
    const data = await listMarketplace();
    response.json(apiOk(data));
  })
);

marketplaceRouter.post(
  "/marketplace",
  requireAuth,
  asyncHandler(async (request, response) => {
    const sellerId = request.user?.uid ?? "anonymous";
    const data = await createListing(request.body, sellerId);
    emitRealtime(request, "marketplace:new", data);
    response.status(201).json(apiOk(data));
  })
);

marketplaceRouter.patch(
  "/marketplace/:id/sold",
  requireAuth,
  asyncHandler(async (request, response) => {
    const listingId = String(request.params.id ?? "");
    const data = await markListingSold(listingId);
    emitRealtime(request, "marketplace:sold", data);
    response.json(apiOk(data));
  })
);
