import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IChat {
  conversationId: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatSchema = new Schema<IChat>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    participants: { type: [String], required: true, index: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now }
  },
  schemaOptions
);

export const ChatModel = model<IChat>("Chat", chatSchema);
export default ChatModel;
