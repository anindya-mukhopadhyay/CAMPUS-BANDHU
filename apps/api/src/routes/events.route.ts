import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import * as eventsController from "../controllers/events.controller";

export const eventsRouter = Router();

eventsRouter.get(
  "/events",
  asyncHandler(eventsController.getAllEvents)
);

eventsRouter.get(
  "/events/:id",
  asyncHandler(eventsController.getEvent)
);

eventsRouter.post(
  "/events",
  requireAuth,
  asyncHandler(eventsController.createEvent)
);

eventsRouter.post(
  "/events/:id/register",
  requireAuth,
  asyncHandler(eventsController.registerForEvent)
);

