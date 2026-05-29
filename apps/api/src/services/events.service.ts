import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { z } from "zod";

import EventModel from "../models/event.model";
import { HttpError } from "../utils/http-error";

const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  venue: z.string().min(2).optional(),
  tags: z.array(z.string()).default([]),
  
  // Compatibility fields
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  maxAttendees: z.number().optional(),
  image: z.string().optional(),
  imageUrl: z.string().optional(),
  id: z.string().optional()
});

export type CreateEventInput = z.infer<typeof eventSchema>;

export async function listEvents(): Promise<Record<string, unknown>[]> {
  const events = await EventModel.find({}).sort({ startAt: 1 }).limit(50);
  return events.map((doc) => doc.toJSON()) as any;
}

export async function getEventById(id: string): Promise<Record<string, unknown>> {
  const event = await EventModel.findById(id);
  if (!event) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Event not found");
  }
  return event.toJSON() as any;
}

export async function createEvent(payload: CreateEventInput, organizerId: string): Promise<Record<string, unknown>> {
  const parsed = eventSchema.parse(payload);
  
  const eventId = parsed.id || new mongoose.Types.ObjectId().toString();
  
  const document = {
    _id: eventId,
    ...parsed,
    organizerId,
    registrations: 0,
    registeredStudentIds: []
  };

  const created = await EventModel.create(document);
  return created.toJSON() as any;
}

export async function registerForEvent(eventId: string, studentId: string): Promise<Record<string, unknown>> {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Event not found");
  }

  // Atomically check and add student registration
  const updatedEvent = await EventModel.findOneAndUpdate(
    { _id: eventId, registeredStudentIds: { $ne: studentId } },
    { 
      $addToSet: { registeredStudentIds: studentId },
      $inc: { registrations: 1, attendees: 1 }
    },
    { new: true }
  );

  // If updatedEvent is null, it means the student was already registered
  if (!updatedEvent) {
    return { eventId, studentId, status: "already_registered" };
  }

  return { eventId, studentId, status: "registered" };
}
