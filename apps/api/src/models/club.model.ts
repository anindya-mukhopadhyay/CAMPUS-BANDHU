import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IClub {
  collegeId: string; // e.g. 'NSUT', 'IITD'
  name: string;      // e.g. 'Web3 Builders'
  category: string;  // e.g. 'Technical'
  founder: string;   // e.g. 'Arjun M.'
  studentsInterested: number;
  status: "active" | "pending" | "rejected";
  allocatedFacultyId?: string;
  allocatedFacultyName?: string;
  allocatedStudentId?: string;
  allocatedStudentName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const clubSchema = new Schema<IClub>(
  {
    collegeId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    founder: { type: String, required: true },
    studentsInterested: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "pending", "rejected"], default: "pending" },
    allocatedFacultyId: { type: String, index: true },
    allocatedFacultyName: { type: String },
    allocatedStudentId: { type: String, index: true },
    allocatedStudentName: { type: String }
  },
  schemaOptions
);

export const ClubModel = model<IClub>("Club", clubSchema);
export default ClubModel;
