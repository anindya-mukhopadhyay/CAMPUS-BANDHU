import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import * as chatController from "../controllers/chat.controller";

export const chatRouter = Router();

chatRouter.get(
  "/conversations",
  requireAuth,
  asyncHandler(chatController.getConversations)
);

chatRouter.get(
  "/messages/:conversationId",
  requireAuth,
  asyncHandler(chatController.getMessages)
);

chatRouter.post(
  "/send",
  requireAuth,
  asyncHandler(chatController.sendMessage)
);
