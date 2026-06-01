import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface ISettings {
  key: string;
  value: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true }
  },
  schemaOptions
);

export const SettingsModel = model<ISettings>("Settings", settingsSchema);
export default SettingsModel;
