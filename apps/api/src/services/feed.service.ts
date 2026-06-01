import { z } from "zod";
import mongoose from "mongoose";
import PostModel from "../models/post.model";

const createPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(2000),
  image: z.string().optional(),
  id: z.string().optional(),
});

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500),
});

export async function listFeedPosts(
  page: number = 1,
  limit: number = 20
): Promise<{
  posts: Record<string, unknown>[];
  total: number;
  page: number;
  hasMore: boolean;
}> {
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    PostModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PostModel.countDocuments(),
  ]);

  return {
    posts: posts.map((doc) => doc.toJSON()) as any,
    total,
    page,
    hasMore: skip + posts.length < total,
  };
}

export async function createFeedPost(
  userId: string,
  authorName: string,
  content: string,
  image?: string,
  authorAvatar?: string,
  authorRole?: string
): Promise<Record<string, unknown>> {
  const parsed = createPostSchema.parse({ content, image });

  const postId = new mongoose.Types.ObjectId().toString();

  const post = {
    _id: postId,
    authorId: userId,
    authorName,
    authorAvatar: authorAvatar || undefined,
    authorRole: authorRole || "student",
    content: parsed.content,
    image: parsed.image || undefined,
    likes: 0,
    comments: 0,
    likedBy: [],
    commentsList: [],
  };

  const created = await PostModel.create(post);
  return created.toJSON() as any;
}

export async function toggleLikePost(
  postId: string,
  userId: string
): Promise<Record<string, unknown>> {
  const post = await PostModel.findById(postId);
  if (!post) throw new Error("Post not found");

  const index = post.likedBy.indexOf(userId);
  if (index > -1) {
    // Unlike
    post.likedBy.splice(index, 1);
  } else {
    // Like
    post.likedBy.push(userId);
  }

  await post.save();
  return {
    postId,
    liked: index === -1,
    likes: post.likes,
    likedBy: post.likedBy,
  };
}

export async function addComment(
  postId: string,
  userId: string,
  authorName: string,
  content: string
): Promise<Record<string, unknown>> {
  const parsed = commentSchema.parse({ content });
  const post = await PostModel.findById(postId);
  if (!post) throw new Error("Post not found");

  const commentId = new mongoose.Types.ObjectId().toString();
  post.commentsList.push({
    _id: commentId,
    authorId: userId,
    authorName,
    content: parsed.content,
    createdAt: new Date(),
  } as any);

  await post.save();
  return post.toJSON() as any;
}

export async function deleteComment(
  postId: string,
  commentId: string,
  userId: string
): Promise<Record<string, unknown>> {
  const post = await PostModel.findById(postId);
  if (!post) throw new Error("Post not found");

  const comment = post.commentsList.find((c: any) => c._id === commentId);
  if (!comment) throw new Error("Comment not found");

  // Only post author or comment author can delete
  if (comment.authorId !== userId && post.authorId !== userId) {
    throw new Error("Not authorized to delete this comment");
  }

  post.commentsList = post.commentsList.filter(
    (c: any) => c._id !== commentId
  ) as any;
  await post.save();
  return post.toJSON() as any;
}

export async function deletePost(
  postId: string,
  userId: string
): Promise<{ success: boolean }> {
  const post = await PostModel.findById(postId);
  if (!post) throw new Error("Post not found");
  if (post.authorId !== userId) {
    throw new Error("Not authorized to delete this post");
  }

  await PostModel.findByIdAndDelete(postId);
  return { success: true };
}

// Keep backwards compatible likePost for legacy callers
export async function likePost(
  postId: string
): Promise<Record<string, unknown>> {
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
