import { Timestamp } from "firebase-admin/firestore";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { firestore } from "../config/firebase-admin";
import { HttpError } from "../lib/http-error";

const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  venue: z.string().min(2),
  tags: z.array(z.string()).default([])
});

export type CreateEventInput = z.infer<typeof eventSchema>;

const eventsRef = firestore.collection("events");

function normalizeTimestamp(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date().toISOString();
}

export async function listEvents(): Promise<Record<string, unknown>[]> {
  const snapshot = await eventsRef.orderBy("startAt", "asc").limit(50).get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startAt: normalizeTimestamp(data.startAt),
      endAt: normalizeTimestamp(data.endAt)
    };
  });
}

export async function getEventById(id: string): Promise<Record<string, unknown>> {
  const doc = await eventsRef.doc(id).get();
  if (!doc.exists) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Event not found");
  }

  const data = doc.data() ?? {};

  return {
    id: doc.id,
    ...data,
    startAt: normalizeTimestamp(data.startAt),
    endAt: normalizeTimestamp(data.endAt)
  };
}

export async function createEvent(payload: CreateEventInput, organizerId: string): Promise<Record<string, unknown>> {
  const parsed = eventSchema.parse(payload);
  const now = new Date().toISOString();
  const document = {
    ...parsed,
    organizerId,
    registrations: 0,
    createdAt: now,
    updatedAt: now
  };

  const created = await eventsRef.add(document);
  return { id: created.id, ...document };
}

export async function registerForEvent(eventId: string, studentId: string): Promise<Record<string, unknown>> {
  const eventDoc = eventsRef.doc(eventId);

  await firestore.runTransaction(async (transaction) => {
    const eventSnapshot = await transaction.get(eventDoc);
    if (!eventSnapshot.exists) {
      throw new HttpError(StatusCodes.NOT_FOUND, "Event not found");
    }

    const registrationRef = eventDoc.collection("registrations").doc(studentId);
    const existingRegistration = await transaction.get(registrationRef);

    if (!existingRegistration.exists) {
      transaction.set(registrationRef, {
        studentId,
        registeredAt: new Date().toISOString()
      });

      const current = (eventSnapshot.get("registrations") as number | undefined) ?? 0;
      transaction.update(eventDoc, {
        registrations: current + 1,
        updatedAt: new Date().toISOString()
      });
    }
  });

  return { eventId, studentId, status: "registered" };
}
