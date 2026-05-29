import { Schema, model, type Document } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface ITeam extends Document {
  name: string;
  event: string;
  matchScore: number;
  creatorId: string;
  creatorName: string;
  skills: string[];
  need: string[];
  members: string[]; // array of uids
  boysCriteria: number;
  girlsCriteria: number;
  membersNeeded: number;
  pendingRequests: string[]; // array of uids
  createdAt?: Date;
  updatedAt?: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    event: { type: String, required: true },
    matchScore: { type: Number, default: 90 },
    creatorId: { type: String, required: true, index: true },
    creatorName: { type: String, required: true },
    skills: { type: [String], default: [] },
    need: { type: [String], default: [] },
    members: { type: [String], default: [] },
    boysCriteria: { type: Number, default: 0 },
    girlsCriteria: { type: Number, default: 0 },
    membersNeeded: { type: Number, default: 0 },
    pendingRequests: { type: [String], default: [] }
  },
  schemaOptions
);

export const TeamModel = model<ITeam>("Team", teamSchema);
export default TeamModel;
