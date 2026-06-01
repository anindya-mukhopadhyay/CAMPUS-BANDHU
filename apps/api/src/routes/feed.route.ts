import { Router } from "express";

import { asyncHandler } from "../utils/async-handler";
import { apiOk } from "../utils/api-response";
import { emitRealtime } from "../utils/socket";
import { requireAuth } from "../middleware/auth";
import {
  createFeedPost,
  toggleLikePost,
  listFeedPosts,
  addComment,
  deleteComment,
  deletePost,
} from "../services/feed.service";

export const feedRouter = Router();

// GET /feed — list all feed posts with optional pagination
feedRouter.get(
  "/feed",
  asyncHandler(async (request, response) => {
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string) || 20;
    const data = await listFeedPosts(page, limit);
    response.json(apiOk(data));
  })
);

// POST /feed — create a new post (text + optional image)
feedRouter.post(
  "/feed",
  requireAuth,
  asyncHandler(async (request, response) => {
    const userId = request.user?.uid ?? "anonymous";
    const authorName =
      request.user?.name ?? request.user?.email ?? "Campus Member";
    const { content, image } = request.body;
    const data = await createFeedPost(
      userId,
      authorName,
      content as string,
      image as string | undefined,
      undefined,
      undefined
    );
    emitRealtime(request, "feed:new", data);
    response.status(201).json(apiOk(data));
  })
);

// POST /feed/:id/like — toggle like/unlike a post
feedRouter.post(
  "/feed/:id/like",
  requireAuth,
  asyncHandler(async (request, response) => {
    const postId = String(request.params.id ?? "");
    const userId = request.user?.uid ?? "anonymous";
    const data = await toggleLikePost(postId, userId);
    emitRealtime(request, "feed:liked", data);
    response.json(apiOk(data));
  })
);

// POST /feed/:id/comments — add a comment to a post
feedRouter.post(
  "/feed/:id/comments",
  requireAuth,
  asyncHandler(async (request, response) => {
    const postId = String(request.params.id ?? "");
    const userId = request.user?.uid ?? "anonymous";
    const authorName =
      request.user?.name ?? request.user?.email ?? "Campus Member";
    const { content } = request.body;
    const data = await addComment(postId, userId, authorName, content as string);
    emitRealtime(request, "feed:comment", data);
    response.json(apiOk(data));
  })
);

// DELETE /feed/:id/comments/:commentId — delete a comment
feedRouter.delete(
  "/feed/:id/comments/:commentId",
  requireAuth,
  asyncHandler(async (request, response) => {
    const postId = String(request.params.id ?? "");
    const commentId = String(request.params.commentId ?? "");
    const userId = request.user?.uid ?? "anonymous";
    const data = await deleteComment(postId, commentId, userId);
    response.json(apiOk(data));
  })
);

// DELETE /feed/:id — delete a post
feedRouter.delete(
  "/feed/:id",
  requireAuth,
  asyncHandler(async (request, response) => {
    const postId = String(request.params.id ?? "");
    const userId = request.user?.uid ?? "anonymous";
    const data = await deletePost(postId, userId);
    response.json(apiOk(data));
  })
);
