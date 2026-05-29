import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IAchievement {
  studentId: string;
  eventId: string;
  title: string;
  metadataUri: string;
  verified: boolean;
  txHash?: string;
  tokenId?: string;
  mintedAt: Date;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    studentId: { type: String, required: true, index: true },
    eventId: { type: String, required: true },
    title: { type: String, required: true },
    metadataUri: { type: String, required: true },
    verified: { type: Boolean, default: false },
    txHash: { type: String },
    tokenId: { type: String },
    mintedAt: { type: Date, default: Date.now },
    note: { type: String }
  },
  schemaOptions
);

export const AchievementModel = model<IAchievement>("Achievement", achievementSchema);
export default AchievementModel;
