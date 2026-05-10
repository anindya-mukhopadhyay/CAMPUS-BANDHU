import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import { apiOk } from "../lib/api-response";
import { emitRealtime } from "../lib/socket";
import { requireAuth } from "../middleware/auth";
import { createFeedPost, likePost, listFeedPosts } from "../services/feed.service";

export const feedRouter = Router();

feedRouter.get(
  "/feed",
  asyncHandler(async (_request, response) => {
    const data = await listFeedPosts();
    response.json(apiOk(data));
  })
);

feedRouter.post(
  "/feed",
  requireAuth,
  asyncHandler(async (request, response) => {
    const userId = request.user?.uid ?? "anonymous";
    const authorName = request.user?.name ?? request.user?.email ?? "Campus Member";
    const data = await createFeedPost(userId, authorName, request.body.content as string);
    emitRealtime(request, "feed:new", data);
    response.status(201).json(apiOk(data));
  })
);

feedRouter.post(
  "/feed/:id/like",
  requireAuth,
  asyncHandler(async (request, response) => {
    const postId = String(request.params.id ?? "");
    const data = await likePost(postId);
    emitRealtime(request, "feed:liked", data);
    response.json(apiOk(data));
  })
);
