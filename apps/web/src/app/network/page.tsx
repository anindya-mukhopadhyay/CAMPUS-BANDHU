"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, MessageCircle, Heart, MessageSquare,
  Share2, Send, Sparkles, X, Trash2,
  MoreHorizontal, Camera
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Avatar } from "@/components/ui/avatar";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { feedService } from "@/services";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const suggestedConnections = [
  { name: "Ravi Gupta", dept: "CSE", mutualFriends: 12, skills: ["React", "Python"] },
  { name: "Ananya Das", dept: "ECE", mutualFriends: 8, skills: ["IoT", "Arduino"] },
  { name: "Karan Joshi", dept: "IT", mutualFriends: 15, skills: ["ML", "Data Science"] },
  { name: "Meera Iyer", dept: "CSE", mutualFriends: 6, skills: ["Figma", "UI/UX"] },
];

const clubs = [
  { name: "Tech Club", members: 340, category: "Technical", active: true },
  { name: "AI Society", members: 180, category: "Technical", active: true },
  { name: "E-Cell", members: 220, category: "Business", active: true },
  { name: "Robotics Club", members: 95, category: "Technical", active: true },
  { name: "Photography Club", members: 150, category: "Creative", active: false },
];

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NetworkPage() {
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuthStore();
  const currentUserId = useAuthStore((s) => s.user?.uid);

  const fetchPosts = async () => {
    try {
      const res = await feedService.getAll();
      const feedData = res.data;
      const postsList = Array.isArray(feedData) ? feedData : (feedData?.posts || []);
      setPosts(postsList);
    } catch (err) {
      console.error("Failed to load feed posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openMenuId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (PNG, JPG, or WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPostImage(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setPostImage(null);
    setImagePreview(null);
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !postImage) return;
    setPosting(true);
    try {
      await feedService.create(postContent, postImage || undefined);
      setPostContent("");
      setPostImage(null);
      setImagePreview(null);
      await fetchPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await feedService.like(postId);
      const likeData = res.data;
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likes: likeData.likes,
              likedBy: likeData.likedBy || p.likedBy,
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    setCommentingOn(postId);
    try {
      const res = await feedService.addComment(postId, content);
      const updatedPost = res.data;
      setPosts(prev =>
        prev.map(p => (p.id === postId ? updatedPost : p))
      );
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      // Auto-expand comments
      setExpandedComments(prev => new Set(prev).add(postId));
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setCommentingOn(null);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const res = await feedService.deleteComment(postId, commentId);
      const updatedPost = res.data;
      setPosts(prev =>
        prev.map(p => (p.id === postId ? updatedPost : p))
      );
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await feedService.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
    setOpenMenuId(null);
  };

  const isLikedByMe = (post: any) => {
    return post.likedBy?.includes(currentUserId);
  };

  return (
    <AppShell>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={stagger.item}>
          <h1 className="font-heading text-3xl font-bold">Campus Network</h1>
          <p className="mt-1 text-sm text-slate">Connect, share, and grow with your campus community</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Feed */}
          <div className="space-y-6">
            {/* ── Post Composer ── */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <div className="flex gap-3">
                  <Avatar name={profile?.fullName || "You"} size="md" status="online" />
                  <div className="flex-1">
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share something with the campus..."
                      rows={3}
                      maxLength={2000}
                      className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                    />

                    {/* Image Preview */}
                    <AnimatePresence>
                      {imagePreview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative mt-2 overflow-hidden rounded-xl"
                        >
                          <img
                            src={imagePreview}
                            alt="Post preview"
                            className="max-h-64 w-full rounded-xl object-cover border border-white/[0.06]"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-slate transition-colors hover:bg-white/[0.06] hover:text-white"
                          title="Add Photo"
                        >
                          <Camera className="h-4 w-4" />
                          <span className="hidden sm:inline">Photo</span>
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-slate transition-colors hover:bg-white/[0.06] hover:text-white">
                          <Sparkles className="h-4 w-4" />
                          <span className="hidden sm:inline">AI Assist</span>
                        </button>
                      </div>
                      {postContent.length > 0 && (
                        <span className="mr-2 text-[10px] text-subtle">{postContent.length}/2000</span>
                      )}
                      <button
                        onClick={handlePostSubmit}
                        disabled={posting || (!postContent.trim() && !postImage)}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-electric px-4 py-2 text-xs font-semibold text-white shadow-glow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow"
                      >
                        {posting ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            Posting...
                          </span>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" /> Post
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Feed Loading/State */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <GlassCard key={i}>
                    <div className="flex gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-white/[0.06]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-white/[0.06]" />
                        <div className="h-3 w-full rounded bg-white/[0.04]" />
                        <div className="h-3 w-3/4 rounded bg-white/[0.04]" />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {!loading && posts.length === 0 && (
              <GlassCard>
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-electric/20">
                    <MessageCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">No posts yet</h3>
                  <p className="mt-1 text-sm text-slate">Be the first to share something with the campus!</p>
                </div>
              </GlassCard>
            )}

            {/* ── Feed Posts ── */}
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={stagger.item}
                  layout
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                >
                  <GlassCard hover>
                    <div className="flex items-start gap-3">
                      <Avatar name={post.authorName} size="md" />
                      <div className="min-w-0 flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{post.authorName}</span>
                            <NeonBadge color={
                              post.authorRole === "faculty" ? "cyan" :
                              post.authorRole === "organizer" ? "blaze" : "blue"
                            } size="sm">{post.authorRole || "student"}</NeonBadge>
                            <span className="text-xs text-slate">· {timeAgo(post.createdAt)}</span>
                          </div>

                          {/* Post menu (delete) — only for post author */}
                          {post.authorId === currentUserId && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === post.id ? null : post.id);
                                }}
                                className="rounded-lg p-1.5 text-slate transition-colors hover:bg-white/[0.06] hover:text-white"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                              <AnimatePresence>
                                {openMenuId === post.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                    className="absolute right-0 top-8 z-20 rounded-xl border border-white/[0.08] bg-[#1a1a2e]/95 p-1 shadow-xl backdrop-blur-xl"
                                  >
                                    <button
                                      onClick={() => handleDeletePost(post.id)}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose transition-colors hover:bg-rose/10"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> Delete Post
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                        {/* Post Image */}
                        {post.image && (
                          <div className="mt-3 overflow-hidden rounded-xl">
                            <img
                              src={post.image}
                              alt="Post image"
                              className="w-full rounded-xl object-cover max-h-96 border border-white/[0.04]"
                            />
                          </div>
                        )}

                        {/* Reactions */}
                        <div className="mt-3 flex items-center gap-3">
                          {post.likes > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm">❤️</span>
                              <span className="text-xs text-slate"><AnimatedCounter value={post.likes} /></span>
                            </div>
                          )}
                          {(post.comments > 0 || post.commentsList?.length > 0) && (
                            <button
                              onClick={() => toggleComments(post.id)}
                              className="text-xs text-slate hover:text-white transition-colors"
                            >
                              {post.commentsList?.length || post.comments} comment{(post.commentsList?.length || post.comments) !== 1 ? "s" : ""}
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex items-center gap-1 border-t border-white/[0.04] pt-3">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-colors ${
                              isLikedByMe(post)
                                ? "text-rose font-semibold"
                                : "text-slate hover:bg-white/[0.04] hover:text-rose"
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${isLikedByMe(post) ? "fill-current" : ""}`} />
                            {isLikedByMe(post) ? "Liked" : "Like"}
                          </button>
                          <button
                            onClick={() => toggleComments(post.id)}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-slate transition-colors hover:bg-white/[0.04] hover:text-accent"
                          >
                            <MessageSquare className="h-4 w-4" /> Comment
                          </button>
                          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-slate transition-colors hover:bg-white/[0.04] hover:text-mint">
                            <Share2 className="h-4 w-4" /> Share
                          </button>
                        </div>

                        {/* ── Comments Section ── */}
                        <AnimatePresence>
                          {expandedComments.has(post.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 space-y-3 border-t border-white/[0.04] pt-3">
                                {/* Comment List */}
                                {post.commentsList?.map((comment: any) => (
                                  <div key={comment._id || comment.id} className="flex gap-2 group">
                                    <Avatar name={comment.authorName} size="sm" />
                                    <div className="flex-1 rounded-xl bg-white/[0.03] px-3 py-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-semibold">{comment.authorName}</span>
                                          <span className="text-[10px] text-subtle">{timeAgo(comment.createdAt)}</span>
                                        </div>
                                        {(comment.authorId === currentUserId || post.authorId === currentUserId) && (
                                          <button
                                            onClick={() => handleDeleteComment(post.id, comment._id || comment.id)}
                                            className="rounded p-1 text-subtle opacity-0 transition-all hover:text-rose group-hover:opacity-100"
                                            title="Delete comment"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                      <p className="mt-0.5 text-xs leading-relaxed text-slate">{comment.content}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* Comment Input */}
                                <div className="flex gap-2">
                                  <Avatar name={profile?.fullName || "You"} size="sm" />
                                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                                    <input
                                      type="text"
                                      value={commentInputs[post.id] || ""}
                                      onChange={(e) =>
                                        setCommentInputs(prev => ({
                                          ...prev,
                                          [post.id]: e.target.value,
                                        }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          handleAddComment(post.id);
                                        }
                                      }}
                                      placeholder="Write a comment..."
                                      maxLength={500}
                                      className="flex-1 bg-transparent text-xs text-white placeholder:text-subtle focus:outline-none"
                                    />
                                    <button
                                      onClick={() => handleAddComment(post.id)}
                                      disabled={!commentInputs[post.id]?.trim() || commentingOn === post.id}
                                      className="rounded-lg p-1.5 text-accent transition-colors hover:bg-accent/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <Send className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6">
            {/* Suggested Connections */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-base font-semibold flex items-center gap-2 text-white">
                  <Users className="h-4 w-4 text-accent" /> Suggested Connections
                </h3>
                <div className="space-y-3">
                  {suggestedConnections.map((person, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar name={person.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{person.name}</p>
                        <p className="text-[10px] text-slate">{person.dept} · {person.mutualFriends} mutual</p>
                      </div>
                      <button className="rounded-lg bg-accent/10 p-1.5 text-accent transition-colors hover:bg-accent/20">
                        <UserPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Clubs */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-base font-semibold flex items-center gap-2 text-white">
                  <MessageCircle className="h-4 w-4 text-purple" /> Campus Clubs
                </h3>
                <div className="space-y-2">
                  {clubs.map((club, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{club.name}</p>
                        <p className="text-[10px] text-slate">{club.members} members</p>
                      </div>
                      <NeonBadge color={club.active ? "mint" : "rose"} size="sm">
                        {club.active ? "Active" : "Inactive"}
                      </NeonBadge>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-3 font-heading text-base font-semibold flex items-center gap-2 text-white">
                  <Sparkles className="h-4 w-4 text-blaze" /> Your Activity
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                    <p className="text-xl font-bold text-accent"><AnimatedCounter value={posts.filter(p => p.authorId === currentUserId).length} /></p>
                    <p className="text-[10px] text-slate">Your Posts</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                    <p className="text-xl font-bold text-rose">
                      <AnimatedCounter value={posts.reduce((sum: number, p: any) => sum + (p.likedBy?.includes(currentUserId) ? 1 : 0), 0)} />
                    </p>
                    <p className="text-[10px] text-slate">Posts Liked</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
