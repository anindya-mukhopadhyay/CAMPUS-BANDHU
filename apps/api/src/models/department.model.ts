import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IDepartment {
  collegeId: string; // unique institutional code, e.g., 'NSUT', 'IITD'
  name: string;      // e.g., 'Computer Science'
  hod: string;       // e.g., 'Dr. A. Sharma'
  students: number;  // students count
  status: "active" | "setup_required";
  createdAt?: Date;
  updatedAt?: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    collegeId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    hod: { type: String, required: true },
    students: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "setup_required"], default: "active" }
  },
  schemaOptions
);

export const DepartmentModel = model<IDepartment>("Department", departmentSchema);
export default DepartmentModel;
