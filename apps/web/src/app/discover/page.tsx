"use client";

import { motion } from "framer-motion";
import {
  Calendar, Flame,
  ArrowRight, Sparkles, BookOpen, Code, Palette, Mic
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";


const trendingTopics = [
  { tag: "hackathon", posts: 342, trend: "+28%" },
  { tag: "ai-ml", posts: 289, trend: "+45%" },
  { tag: "placement", posts: 198, trend: "+12%" },
  { tag: "web3", posts: 156, trend: "+67%" },
  { tag: "cultural-fest", posts: 134, trend: "+19%" },
];

const categories = [
  { name: "Technical", icon: Code, color: "text-accent", count: 45 },
  { name: "Cultural", icon: Palette, color: "text-purple", count: 23 },
  { name: "Academic", icon: BookOpen, color: "text-mint", count: 38 },
  { name: "Music & Arts", icon: Mic, color: "text-blaze", count: 16 },
];

const teamMatches = [
  { team: "CodeCrafters", event: "Campus Hackathon", matchScore: 94, members: 3, need: ["Backend Dev", "UI Designer"], skills: ["React", "Node.js", "Python"] },
  { team: "DataMinds", event: "ML Challenge", matchScore: 87, members: 2, need: ["Data Engineer"], skills: ["Python", "TensorFlow", "SQL"] },
  { team: "BlockBusters", event: "Web3 Buildathon", matchScore: 82, members: 4, need: ["Smart Contract Dev"], skills: ["Solidity", "Ethereum", "React"] },
];

const upcomingEvents = [
  { title: "Campus Hackathon 2024", date: "May 18", attendees: 248, category: "Hackathon" },
  { title: "AI Workshop", date: "May 15", attendees: 45, category: "Workshop" },
  { title: "Startup Pitch Night", date: "May 20", attendees: 80, category: "Career" },
  { title: "Cultural Night", date: "May 22", attendees: 500, category: "Cultural" },
];

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

export default function DiscoverPage() {
  return (
    <AppShell>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={stagger.item}>
          <h1 className="font-heading text-3xl font-bold">Discover</h1>
          <p className="mt-1 text-sm text-slate">Explore what&apos;s happening across campus — events, trends, and AI team matches</p>
        </motion.div>

        {/* AI Team Matching */}
        <motion.div variants={stagger.item}>
          <GlassCard className="relative overflow-hidden" glow="purple">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple/10 blur-[60px]" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple" />
                <h2 className="font-heading text-lg font-semibold">AI Team Matching</h2>
                <NeonBadge color="purple" size="sm" pulse>Smart Match</NeonBadge>
              </div>
              <p className="text-sm text-slate mb-4">Teams looking for members like you — matched by skills, interests, and availability.</p>
              <div className="grid gap-3 md:grid-cols-3">
                {teamMatches.map((team, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{team.team}</h3>
                      <span className="font-heading text-lg font-bold text-mint">{team.matchScore}%</span>
                    </div>
                    <p className="text-xs text-slate mb-2">{team.event}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {team.skills.map((s) => (
                        <span key={s} className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-slate">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate">
                      <span>{team.members} members</span>
                      <span className="text-accent">Need: {team.need.join(", ")}</span>
                    </div>
                    <button className="mt-3 w-full rounded-lg bg-accent/10 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20">
                      Join Team
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Categories */}
            <motion.div variants={stagger.item} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((cat) => (
                <GlassCard key={cat.name} hover padding="sm" className="text-center cursor-pointer">
                  <cat.icon className={`mx-auto h-6 w-6 ${cat.color}`} />
                  <p className="mt-2 text-sm font-semibold">{cat.name}</p>
                  <p className="text-xs text-slate">{cat.count} active</p>
                </GlassCard>
              ))}
            </motion.div>

            {/* Upcoming */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" /> Upcoming Events
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-slate">{event.date} · {event.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate"><AnimatedCounter value={event.attendees} /> going</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-base font-semibold flex items-center gap-2">
                  <Flame className="h-4 w-4 text-blaze" /> Trending Topics
                </h3>
                <div className="space-y-2">
                  {trendingTopics.map((topic, i) => (
                    <div key={topic.tag} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-subtle font-medium">#{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">#{topic.tag}</p>
                          <p className="text-[10px] text-slate">{topic.posts} posts</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-mint">{topic.trend}</span>
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
