import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IAnnouncement {
  title: string;
  content: string;
  targetAudience: string; // 'all' | 'students' | 'admins'
  createdAt?: Date;
  updatedAt?: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetAudience: { type: String, default: "all" }
  },
  schemaOptions
);

export const AnnouncementModel = model<IAnnouncement>("Announcement", announcementSchema);
export default AnnouncementModel;
