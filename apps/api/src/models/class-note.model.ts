import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IClassNote {
  classId: string;        // Refers to Class ID
  title: string;          // e.g. "Lecture 3: Neural Networks Intro"
  content: string;        // Text rich notes
  pdfData?: string;       // base64 encoded PDF string
  pdfName?: string;       // uploaded filename
  senderName: string;     // Teacher name
  createdAt?: Date;
  updatedAt?: Date;
}

const classNoteSchema = new Schema<IClassNote>(
  {
    classId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    pdfData: { type: String },
    pdfName: { type: String },
    senderName: { type: String, required: true }
  },
  schemaOptions
);

export const ClassNoteModel = model<IClassNote>("ClassNote", classNoteSchema);
export default ClassNoteModel;
