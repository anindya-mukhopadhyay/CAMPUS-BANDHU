import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface ICollege {
  name: string;
  code: string; // unique, e.g., 'NSUT', 'IITD'
  status: "active" | "pending";
  createdAt?: Date;
  updatedAt?: Date;
}

const collegeSchema = new Schema<ICollege>(
  {
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    status: { type: String, enum: ["active", "pending"], default: "pending" }
  },
  schemaOptions
);

export const CollegeModel = model<ICollege>("College", collegeSchema);
export default CollegeModel;
