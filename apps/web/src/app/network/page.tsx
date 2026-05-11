"use client";

import { useState } from "react";
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

const feedPosts = [
  {
    id: "1", author: "Arjun Mehta", role: "student", dept: "CSE",
    content: "Just submitted my project for the Campus Hackathon 2024! Building an AI-powered study planner 🚀 Team CodeCrafters let's go! #hackathon #ai",
    likes: 42, comments: 8, shares: 3, time: "2h ago",
    reactions: ["🔥", "💪", "🎯"]
  },
  {
    id: "2", author: "Dr. Vikram Singh", role: "faculty", dept: "CSE",
    content: "Excited to announce our new elective on 'Generative AI & LLM Applications' starting next semester. Limited seats — register early!",
    likes: 89, comments: 15, shares: 12, time: "5h ago",
    reactions: ["🙌", "📚", "⭐"]
  },
  {
    id: "3", author: "Tech Club NSUT", role: "organizer", dept: "Club",
    content: "Registrations for the Cybersecurity CTF are now OPEN! 🏴‍☠️ Top 3 teams win cash prizes + internship referrals. Link in bio.",
    likes: 156, comments: 23, shares: 45, time: "1d ago",
    reactions: ["🔥", "🏆", "💻"]
  },
  {
    id: "4", author: "Sneha Patel", role: "student", dept: "CSE",
    content: "Just earned the 'Hackathon Hero' badge after participating in 5 hackathons this semester! The gamification on Campus-Bandhu really motivates me 💪",
    likes: 67, comments: 12, shares: 5, time: "1d ago",
    reactions: ["🏆", "👏", "🎉"]
  },
];

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
                  <Avatar name="You" size="md" status="online" />
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
                      <button className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-electric px-4 py-2 text-xs font-semibold text-white shadow-glow-sm">
                        <Send className="h-3.5 w-3.5" /> Post
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Feed */}
            {feedPosts.map((post) => (
              <motion.div key={post.id} variants={stagger.item}>
                <GlassCard hover>
                  <div className="flex items-start gap-3">
                    <Avatar name={post.author} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.author}</span>
                        <NeonBadge color={
                          post.role === "faculty" ? "cyan" :
                          post.role === "organizer" ? "blaze" : "blue"
                        } size="sm">{post.role}</NeonBadge>
                        <span className="text-xs text-slate">· {post.time}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{post.content}</p>

                      {/* Reactions */}
                      <div className="mt-3 flex items-center gap-1">
                        {post.reactions.map((r, i) => (
                          <span key={i} className="text-sm">{r}</span>
                        ))}
                        <span className="ml-1 text-xs text-slate"><AnimatedCounter value={post.likes} /></span>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-1 border-t border-white/[0.04] pt-3">
                        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-slate transition-colors hover:bg-white/[0.04] hover:text-rose">
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
                <h3 className="mb-4 font-heading text-base font-semibold flex items-center gap-2">
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
                <h3 className="mb-4 font-heading text-base font-semibold flex items-center gap-2">
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
