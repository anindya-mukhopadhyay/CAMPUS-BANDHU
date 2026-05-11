import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { apiOk } from "../utils/api-response";
import { emitRealtime } from "../utils/socket";
import * as eventService from "../services/events.service";

export async function getAllEvents(_request: Request, response: Response) {
  const data = await eventService.listEvents();
  response.json(apiOk(data));
}

export async function getEvent(request: Request, response: Response) {
  const eventId = String(request.params.id ?? "");
  const data = await eventService.getEventById(eventId);
  response.json(apiOk(data));
}

export async function createEvent(request: Request, response: Response) {
  const organizerId = (request as any).user?.uid ?? "anonymous";
  const data = await eventService.createEvent(request.body, organizerId);
  emitRealtime(request, "events:new", data);
  response.status(StatusCodes.CREATED).json(apiOk(data));
}

export async function registerForEvent(request: Request, response: Response) {
  const studentId = (request as any).user?.uid ?? "anonymous";
  const eventId = String(request.params.id ?? "");
  const data = await eventService.registerForEvent(eventId, studentId);
  emitRealtime(request, "events:registration", data);
  response.json(apiOk(data));
}
