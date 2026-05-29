import { z } from "zod";
import mongoose from "mongoose";
import PostModel from "../models/post.model";

const createPostSchema = z.object({
  content: z.string().min(3).max(500),
  id: z.string().optional()
});

export async function listFeedPosts(): Promise<Record<string, unknown>[]> {
  const posts = await PostModel.find({}).sort({ createdAt: -1 }).limit(30);
  return posts.map((doc) => doc.toJSON()) as any;
}

export async function createFeedPost(userId: string, authorName: string, content: string): Promise<Record<string, unknown>> {
  const parsed = createPostSchema.parse({ content });
  
  const postId = parsed.id || new mongoose.Types.ObjectId().toString();

  const post = {
    _id: postId,
    authorId: userId,
    authorName,
    content: parsed.content,
    likes: 0,
    comments: 0
  };

  const created = await PostModel.create(post);
  return created.toJSON() as any;
}

export async function likePost(postId: string): Promise<Record<string, unknown>> {
  const updated = await PostModel.findByIdAndUpdate(
    postId,
    { $inc: { likes: 1, likesCount: 1 } },
    { new: true }
  );

  if (!updated) {
    throw new Error("Post not found");
  }

  return { postId, status: "liked", likes: updated.likes };
}
