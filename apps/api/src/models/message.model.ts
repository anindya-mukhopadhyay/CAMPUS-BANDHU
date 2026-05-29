import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IMessage {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  status: string; // 'sent', 'delivered', 'read'
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: "sent" }
  },
  schemaOptions
);

export const MessageModel = model<IMessage>("Message", messageSchema);
export default MessageModel;
