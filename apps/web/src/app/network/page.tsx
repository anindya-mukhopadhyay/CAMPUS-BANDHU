"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, MessageCircle, Heart, MessageSquare,
  Share2, Image, Send, Sparkles
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

export default function NetworkPage() {
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthStore();

  const fetchPosts = async () => {
    try {
      const res = await feedService.getAll();
      setPosts(res.data || []);
    } catch (err) {
      console.error("Failed to load feed posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async () => {
    if (!postContent.trim()) return;
    try {
      await feedService.create(postContent);
      setPostContent("");
      await fetchPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await feedService.like(postId);
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p))
      );
    } catch (err) {
      console.error("Failed to like post:", err);
    }
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
            {/* Post Composer */}
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
                      className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button className="rounded-lg p-2 text-slate transition-colors hover:bg-white/[0.06] hover:text-white">
                          <Image className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-slate transition-colors hover:bg-white/[0.06] hover:text-white">
                          <Sparkles className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={handlePostSubmit}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-electric px-4 py-2 text-xs font-semibold text-white shadow-glow-sm"
                      >
                        <Send className="h-3.5 w-3.5" /> Post
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Feed Loading/State */}
            {loading && (
              <p className="text-sm text-slate italic text-center py-4">Syncing network feed...</p>
            )}

            {!loading && posts.length === 0 && (
              <p className="text-sm text-slate italic text-center py-4">No campus updates yet. Be the first to share!</p>
            )}

            {/* Feed */}
            {posts.map((post) => (
              <motion.div key={post.id} variants={stagger.item}>
                <GlassCard hover>
                  <div className="flex items-start gap-3">
                    <Avatar name={post.authorName} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.authorName}</span>
                        <NeonBadge color={
                          post.authorRole === "faculty" ? "cyan" :
                          post.authorRole === "organizer" ? "blaze" : "blue"
                        } size="sm">{post.authorRole || "student"}</NeonBadge>
                        <span className="text-xs text-slate">· {new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{post.content}</p>

                      {/* Reactions */}
                      <div className="mt-3 flex items-center gap-1">
                        <span className="text-sm">🔥</span>
                        <span className="ml-1 text-xs text-slate"><AnimatedCounter value={post.likes} /></span>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-1 border-t border-white/[0.04] pt-3">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-slate transition-colors hover:bg-white/[0.04] hover:text-rose"
                        >
                          <Heart className="h-4 w-4" /> Like
                        </button>
                        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-slate transition-colors hover:bg-white/[0.04] hover:text-accent">
                          <MessageSquare className="h-4 w-4" /> Comment
                        </button>
                        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-slate transition-colors hover:bg-white/[0.04] hover:text-mint">
                          <Share2 className="h-4 w-4" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Right Sidebar */}
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
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
