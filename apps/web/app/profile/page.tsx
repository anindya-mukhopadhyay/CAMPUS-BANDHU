"use client";

import { motion } from "framer-motion";
import {
  MapPin, Mail, Calendar, BookOpen, Award, Star,
  Edit3
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore, ROLE_LABELS, ROLE_COLORS } from "@/lib/stores/useAuthStore";

const achievements = [
  { title: "Hackathon Hero", description: "Won 3 hackathons", icon: "🏆", rarity: "Legendary" },
  { title: "Event Explorer", description: "Attended 20+ events", icon: "🎯", rarity: "Epic" },
  { title: "Social Butterfly", description: "100+ connections", icon: "🦋", rarity: "Rare" },
  { title: "Code Warrior", description: "500+ commits", icon: "⚔️", rarity: "Epic" },
  { title: "First Steps", description: "Created profile", icon: "👣", rarity: "Common" },
  { title: "Team Player", description: "Joined 5 teams", icon: "🤝", rarity: "Rare" },
];

const skills = [
  { name: "React", level: 85 },
  { name: "Python", level: 72 },
  { name: "Machine Learning", level: 58 },
  { name: "Node.js", level: 78 },
  { name: "TypeScript", level: 80 },
  { name: "Blockchain", level: 45 },
];

const rarityColors: Record<string, string> = {
  Legendary: "blaze",
  Epic: "purple",
  Rare: "cyan",
  Common: "blue",
};

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

export default function ProfilePage() {
  const { profile, role, user } = useAuthStore();

  return (
    <AppShell>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        {/* Profile Header */}
        <motion.div variants={stagger.item}>
          <GlassCard className="relative overflow-hidden">
            {/* Banner */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-accent/20 via-purple/20 to-electric/20" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 grid-background opacity-40" />

            <div className="relative pt-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <Avatar
                    src={user?.photoURL}
                    name={profile?.fullName || "User"}
                    size="xl"
                    status="online"
                    glow
                    className="ring-4 ring-base"
                  />
                  <div>
                    <h1 className="font-heading text-2xl font-bold">{profile?.fullName || "User"}</h1>
                    <div className="mt-1 flex items-center gap-2">
                      <NeonBadge color={(ROLE_COLORS[role!] || "blue") as any}>
                        {ROLE_LABELS[role!] || "Student"}
                      </NeonBadge>
                      <span className="text-xs text-slate">{profile?.department || "Computer Science"}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10">
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </button>
              </div>

              {/* Bio + Info */}
              <p className="mt-4 text-sm text-slate max-w-2xl">
                {profile?.bio || "Passionate about AI, blockchain, and building the future of campus life. Always up for a hackathon! 🚀"}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> NSUT, New Delhi</span>
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user?.email || "student@campus.edu"}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Class of {profile?.graduationYear || 2025}</span>
                <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {profile?.department || "CSE"}</span>
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Events", value: 24, color: "text-accent" },
                  { label: "Connections", value: 186, color: "text-mint" },
                  { label: "Achievements", value: 18, color: "text-purple" },
                  { label: "XP", value: 2840, color: "text-blaze" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/[0.03] p-3 text-center border border-white/[0.04]">
                    <p className={`font-heading text-xl font-bold ${stat.color}`}>
                      <AnimatedCounter value={stat.value} />
                    </p>
                    <p className="text-[10px] text-slate">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Skills */}
          <motion.div variants={stagger.item}>
            <GlassCard>
              <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-blaze" /> Skills
              </h3>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{skill.name}</span>
                      <span className="text-slate">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-accent to-electric"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(profile?.interests || ["ai", "blockchain", "hackathon"]).map((tag) => (
                  <span key={tag} className="rounded-md bg-accent/10 px-2 py-1 text-[10px] font-medium text-accent">
                    #{tag}
                  </span>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={stagger.item}>
            <GlassCard>
              <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-purple" /> NFT Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((ach, i) => (
                  <div
                    key={i}
                    className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center transition-all hover:bg-white/[0.04] hover:border-white/[0.12]"
                  >
                    <span className="text-3xl">{ach.icon}</span>
                    <p className="mt-2 text-sm font-medium">{ach.title}</p>
                    <p className="text-[10px] text-slate">{ach.description}</p>
                    <NeonBadge color={(rarityColors[ach.rarity] || "blue") as any} size="sm" className="mt-2">
                      {ach.rarity}
                    </NeonBadge>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}
