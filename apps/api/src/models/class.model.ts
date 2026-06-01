import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IClass {
  name: string;                // e.g. "Advanced Machine Learning"
  code: string;                // e.g. "CSE-401"
  teacherId: string;           // Faculty advisor UID
  teacherName: string;
  department: string;
  collegeId: string;           // NSUT, IITD etc.
  registeredStudentIds: string[]; // List of student UIDs registered
  createdAt?: Date;
  updatedAt?: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    teacherId: { type: String, required: true, index: true },
    teacherName: { type: String, required: true },
    department: { type: String, required: true },
    collegeId: { type: String, required: true, index: true },
    registeredStudentIds: { type: [String], default: [] }
  },
  schemaOptions
);

export const ClassModel = model<IClass>("Class", classSchema);
export default ClassModel;
