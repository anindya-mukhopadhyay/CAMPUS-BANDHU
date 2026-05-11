import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { firestore } from "../config/firebase-admin";
import { apiOk } from "../utils/api-response";
import { emitRealtime } from "../utils/socket";

export async function getAnalytics(_request: Request, response: Response) {
  // Aggregate stats from multiple collections
  const [users, events, listings] = await Promise.all([
    firestore.collection("users").count().get(),
    firestore.collection("events").count().get(),
    firestore.collection("marketplace").count().get()
  ]);

  response.json(apiOk({
    totalUsers: users.data().count,
    totalEvents: events.data().count,
    activeListings: listings.data().count,
    timestamp: new Date().toISOString()
  }));
}

export async function moderateUser(request: Request, response: Response) {
  const { userId, action } = request.body; // action: 'ban' | 'unban'
  
  const status = action === "ban" ? "banned" : "active";
  await firestore.collection("users").doc(userId).update({ status, updatedAt: new Date().toISOString() });
  
  response.json(apiOk({ userId, status }));
}

export async function postAnnouncement(request: Request, response: Response) {
  const { title, content, targetAudience } = request.body;
  
  const announcement = {
    title,
    content,
    targetAudience, // 'all' | 'students' | 'admins'
    createdAt: new Date().toISOString()
  };

  const doc = await firestore.collection("announcements").add(announcement);
  
  // Broadcast via sockets
  emitRealtime(request, "admin:announcement", { id: doc.id, ...announcement });
  
  response.status(StatusCodes.CREATED).json(apiOk({ id: doc.id, ...announcement }));
}
