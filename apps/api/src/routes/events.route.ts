import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import { apiOk } from "../lib/api-response";
import { emitRealtime } from "../lib/socket";
import { requireAuth } from "../middleware/auth";
import { createEvent, getEventById, listEvents, registerForEvent } from "../services/events.service";

export const eventsRouter = Router();

eventsRouter.get(
  "/events",
  asyncHandler(async (_request, response) => {
    const data = await listEvents();
    response.json(apiOk(data));
  })
);

eventsRouter.get(
  "/events/:id",
  asyncHandler(async (request, response) => {
    const eventId = String(request.params.id ?? "");
    const data = await getEventById(eventId);
    response.json(apiOk(data));
  })
);

eventsRouter.post(
  "/events",
  requireAuth,
  asyncHandler(async (request, response) => {
    const organizerId = request.user?.uid ?? "anonymous";
    const data = await createEvent(request.body, organizerId);
    emitRealtime(request, "events:new", data);
    response.status(201).json(apiOk(data));
  })
);

eventsRouter.post(
  "/events/:id/register",
  requireAuth,
  asyncHandler(async (request, response) => {
    const studentId = request.user?.uid ?? "anonymous";
    const eventId = String(request.params.id ?? "");
    const data = await registerForEvent(eventId, studentId);
    emitRealtime(request, "events:registration", data);
    response.json(apiOk(data));
  })
);
