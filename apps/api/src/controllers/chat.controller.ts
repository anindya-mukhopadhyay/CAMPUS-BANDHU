import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { apiOk } from "../utils/api-response";
import { emitRealtime } from "../utils/socket";
import * as chatService from "../services/chat.service";

export async function getConversations(request: Request, response: Response) {
  const userId = (request as any).user?.uid;
  if (!userId) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
    return;
  }
  const data = await chatService.getConversations(userId);
  response.json(apiOk(data));
}

export async function getMessages(request: Request, response: Response) {
  const { conversationId } = request.params;
  const data = await chatService.getMessages(String(conversationId ?? ""));
  response.json(apiOk(data));
}

export async function sendMessage(request: Request, response: Response) {
  const senderId = (request as any).user?.uid;
  if (!senderId) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
    return;
  }
  const { receiverId, content } = request.body;
  const data = await chatService.sendMessage(senderId, receiverId, content);
  
  // Emit to both participants
  emitRealtime(request, `chat:${receiverId}`, { ...data, conversationId: [senderId, receiverId].sort().join("_") });
  
  response.status(StatusCodes.CREATED).json(apiOk(data));
}
