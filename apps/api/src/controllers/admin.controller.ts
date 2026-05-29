import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import UserModel from "../models/user.model";
import EventModel from "../models/event.model";
import ListingModel from "../models/listing.model";
import AnnouncementModel from "../models/announcement.model";
import { apiOk } from "../utils/api-response";
import { emitRealtime } from "../utils/socket";
import { runDatabaseSeed } from "../utils/seed-helper";

export async function getAnalytics(_request: Request, response: Response) {
  // Aggregate stats from multiple collections
  const [totalUsers, totalEvents, activeListings] = await Promise.all([
    UserModel.countDocuments(),
    EventModel.countDocuments(),
    ListingModel.countDocuments()
  ]);

  response.json(apiOk({
    totalUsers,
    totalEvents,
    activeListings,
    timestamp: new Date().toISOString()
  }));
}

export async function moderateUser(request: Request, response: Response) {
  const { userId, action } = request.body; // action: 'ban' | 'unban'
  
  const status = action === "ban" ? "banned" : "active";
  await UserModel.findOneAndUpdate(
    { uid: userId },
    { status },
    { new: true }
  );
  
  response.json(apiOk({ userId, status }));
}

export async function postAnnouncement(request: Request, response: Response) {
  const { title, content, targetAudience } = request.body;
  
  const announcementDoc = await AnnouncementModel.create({
    title,
    content,
    targetAudience // 'all' | 'students' | 'admins'
  });

  const announcement = announcementDoc.toJSON() as any;
  
  // Broadcast via sockets
  emitRealtime(request, "admin:announcement", announcement);
  
  response.status(StatusCodes.CREATED).json(apiOk(announcement));
}

export async function seedDatabase(request: Request, response: Response) {
  const userId = (request as any).user?.uid;
  const userDisplayName = (request as any).user?.name || (request as any).user?.displayName || "Demo User";
  
  await runDatabaseSeed(userId, userDisplayName);
  
  response.json(apiOk({ message: "Database seeded successfully!" }));
}
