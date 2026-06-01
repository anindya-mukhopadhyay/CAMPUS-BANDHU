"use client";

import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/api/client";
import type { CampusPost } from "@/types/domain";

export function NetworkPanel() {
  const query = useQuery({
    queryKey: ["feed"],
    queryFn: () => apiRequest<{
      data: CampusPost[] | {
        posts: CampusPost[];
        total: number;
        page: number;
        hasMore: boolean;
      };
    }>("/feed")
  });

  const responseData = query.data?.data;
  const posts: CampusPost[] = Array.isArray(responseData)
    ? responseData
    : (responseData && "posts" in responseData ? responseData.posts : []);

  return (
    <Card>
      <h3 className="mb-4 font-heading text-xl font-semibold">Campus Network Pulse</h3>
      {query.isLoading ? <p className="text-sm text-slate">Loading collaboration feed...</p> : null}
      <div className="space-y-3">
        {posts.slice(0, 3).map((post) => (
          <div key={post.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-accent">{post.authorName}</p>
            <p className="mt-1 text-sm">{post.content}</p>
            <p className="mt-2 text-xs text-slate">
              {post.likes} likes · {post.comments} comments
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
