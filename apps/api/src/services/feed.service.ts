import { z } from "zod";

import { firestore } from "../config/firebase-admin";

const postsRef = firestore.collection("posts");

const createPostSchema = z.object({
  content: z.string().min(3).max(500)
});

export async function listFeedPosts(): Promise<Record<string, unknown>[]> {
  const snapshot = await postsRef.orderBy("createdAt", "desc").limit(30).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createFeedPost(userId: string, authorName: string, content: string): Promise<Record<string, unknown>> {
  const parsed = createPostSchema.parse({ content });
  const post = {
    authorId: userId,
    authorName,
    content: parsed.content,
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const created = await postsRef.add(post);
  return { id: created.id, ...post };
}

export async function likePost(postId: string): Promise<Record<string, unknown>> {
  const postRef = postsRef.doc(postId);

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(postRef);
    if (!snapshot.exists) {
      throw new Error("Post not found");
    }

    const likes = (snapshot.get("likes") as number | undefined) ?? 0;
    transaction.update(postRef, { likes: likes + 1, updatedAt: new Date().toISOString() });
  });

  return { postId, status: "liked" };
}
