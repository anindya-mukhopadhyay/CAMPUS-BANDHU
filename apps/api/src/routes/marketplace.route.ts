import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import * as marketplaceController from "../controllers/marketplace.controller";

export const marketplaceRouter = Router();

marketplaceRouter.get(
  "/marketplace",
  asyncHandler(marketplaceController.getAllListings)
);

marketplaceRouter.post(
  "/marketplace",
  requireAuth,
  asyncHandler(marketplaceController.createListing)
);

marketplaceRouter.patch(
  "/marketplace/:id",
  requireAuth,
  asyncHandler(marketplaceController.updateListing)
);

marketplaceRouter.delete(
  "/marketplace/:id",
  requireAuth,
  asyncHandler(marketplaceController.deleteListing)
);

marketplaceRouter.patch(
  "/marketplace/:id/sold",
  requireAuth,
  asyncHandler(marketplaceController.markAsSold)
);

