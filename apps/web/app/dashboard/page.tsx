"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, Calendar, Award, Star, Target,
  Bell, Flame, Trophy
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const xpData = { current: 2840, nextLevel: 3500, level: 12 };

const badges = [
  { name: "Hackathon Hero", icon: "🏆", earned: true },
  { name: "Event Explorer", icon: "🎯", earned: true },
  { name: "Social Butterfly", icon: "🦋", earned: true },
  { name: "Code Warrior", icon: "⚔️", earned: true },
  { name: "Mentor", icon: "🧑‍🏫", earned: false },
  { name: "Top Seller", icon: "💰", earned: false },
];

const skills = [
  { name: "React", level: 85, color: "bg-accent" },
  { name: "Python", level: 72, color: "bg-mint" },
  { name: "Machine Learning", level: 58, color: "bg-purple" },
  { name: "Node.js", level: 78, color: "bg-blaze" },
  { name: "Blockchain", level: 45, color: "bg-cyan" },
];

const timeline = [
  { date: "May 10", title: "Won Campus Hackathon", type: "achievement", xp: 500 },
  { date: "May 8", title: "Attended AI Workshop", type: "event", xp: 100 },
  { date: "May 5", title: "Sold Arduino Kit on Marketplace", type: "marketplace", xp: 50 },
  { date: "May 3", title: "Joined Robotics Club", type: "social", xp: 75 },
  { date: "Apr 28", title: "Completed 10-Day Streak", type: "streak", xp: 200 },
];

const leaderboard = [
  { rank: 1, name: "Arjun Mehta", xp: 5240, dept: "CSE" },
  { rank: 2, name: "Priya Sharma", xp: 4890, dept: "ECE" },
  { rank: 3, name: "Rahul Kumar", xp: 4560, dept: "IT" },
  { rank: 4, name: "Sneha Patel", xp: 4120, dept: "CSE" },
  { rank: 5, name: "Vikram Singh", xp: 3980, dept: "ME" },
];

const notifications = [
  { text: "Campus Hackathon starts in 2 days", type: "event", time: "2h ago" },
  { text: "Your listing 'Arduino Kit' got a new offer", type: "marketplace", time: "4h ago" },
  { text: "Dr. Sharma recommended you for ML Internship", type: "recruiter", time: "1d ago" },
  { text: "Team invite from CodeCrafters", type: "team", time: "1d ago" },
];

const stagger = {
  container: { transition: { staggerChildren: 0.06 } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }
};

export default function DashboardPage() {
  const { profile } = useAuthStore();

  return (
    <AppShell>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        {/* ── Welcome + Stats ──────────────────────── */}
        <motion.div variants={stagger.item} className="grid gap-4 md:grid-cols-4">
          {/* Welcome Card */}
          <GlassCard className="md:col-span-2 relative overflow-hidden" glow="blue">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-[60px]" />
            <div className="relative flex items-center gap-4">
              <Avatar
                src={null}
                name={profile?.fullName || "Student"}
                size="xl"
                status="online"
                glow
              />
              <div>
                <p className="text-sm text-slate">Welcome back</p>
                <h2 className="font-heading text-2xl font-bold">{profile?.fullName || "Student"}</h2>
                <div className="mt-2 flex gap-2">
                  <NeonBadge color="blue" size="sm">Level {xpData.level}</NeonBadge>
                  <NeonBadge color="mint" size="sm" pulse>
                    <Flame className="h-3 w-3" /> 7-day streak
                  </NeonBadge>
                </div>
              </div>
            </div>
            {/* XP Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate">XP Progress</span>
                <span className="font-semibold text-accent">
                  <AnimatedCounter value={xpData.current} /> / {xpData.nextLevel}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(xpData.current / xpData.nextLevel) * 100}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-accent to-electric shadow-[0_0_10px_rgba(0,212,255,0.4)]"
                />
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats */}
          {[
            { label: "Events Attended", value: 24, icon: Calendar, color: "text-accent" },
            { label: "Achievements", value: 18, icon: Award, color: "text-mint" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={stagger.item}>
              <GlassCard className="h-full">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className={`font-heading text-2xl font-bold ${stat.color}`}>
                      <AnimatedCounter value={stat.value} />
                    </p>
                    <p className="text-xs text-slate">{stat.label}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main Grid ───────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Tracker */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" /> Skill Tracker
                  </h3>
                  <NeonBadge color="cyan" size="sm">AI Assessed</NeonBadge>
                </div>
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{skill.name}</span>
                        <span className="text-slate">{skill.level}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                          className={`h-full rounded-full ${skill.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Achievement Timeline */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-mint" /> Achievement Timeline
                </h3>
                <div className="relative ml-3 space-y-4 border-l border-white/10 pl-6">
                  {timeline.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="relative"
                    >
                      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-accent bg-base" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-slate">{item.date}</p>
                        </div>
                        <NeonBadge color="mint" size="sm">+{item.xp} XP</NeonBadge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Badges */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-blaze" /> Badges
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.name}
                      className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                        badge.earned
                          ? "bg-white/[0.04] hover:bg-white/[0.08]"
                          : "opacity-30"
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="mt-1 text-[10px] text-slate">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Leaderboard */}
            <motion.div variants={stagger.item}>
              <GlassCard glow="purple">
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple" /> Campus Leaderboard
                </h3>
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                        entry.rank <= 3 ? "bg-white/[0.04]" : ""
                      }`}
                    >
                      <span className={`w-6 text-center font-heading text-sm font-bold ${
                        entry.rank === 1 ? "text-blaze" : entry.rank === 2 ? "text-slate" : entry.rank === 3 ? "text-amber-600" : "text-subtle"
                      }`}>
                        {entry.rank}
                      </span>
                      <Avatar name={entry.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{entry.name}</p>
                        <p className="text-[10px] text-slate">{entry.dept}</p>
                      </div>
                      <span className="text-xs font-semibold text-purple">
                        <AnimatedCounter value={entry.xp} /> XP
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Notifications */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-cyan" /> Notifications
                </h3>
                <div className="space-y-2">
                  {notifications.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3">
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                        n.type === "event" ? "bg-accent" :
                        n.type === "marketplace" ? "bg-blaze" :
                        n.type === "recruiter" ? "bg-purple" : "bg-mint"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{n.text}</p>
                        <p className="text-[10px] text-slate">{n.time}</p>
                      </div>
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
