import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IAuditLog {
  action: string; // e.g., 'User banned', 'College verified'
  target: string; // e.g., 'johndoe@gmail.com', 'NIT Trichy'
  admin: string;  // e.g., 'Super Admin', 'system'
  type: "success" | "warning" | "info";
  createdAt?: Date;
  updatedAt?: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    target: { type: String, required: true },
    admin: { type: String, required: true },
    type: { type: String, enum: ["success", "warning", "info"], default: "info" }
  },
  schemaOptions
);

export const AuditLogModel = model<IAuditLog>("AuditLog", auditLogSchema);
export default AuditLogModel;
