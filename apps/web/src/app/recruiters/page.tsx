"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Building2, MapPin, Briefcase, Users, TrendingUp,
  Award, ExternalLink, Eye, Star
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Avatar } from "@/components/ui/avatar";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Tabs } from "@/components/ui/tabs";

const opportunities = [
  { id: "1", title: "Software Development Engineer I", company: "GlobalTech Inc.", location: "Bangalore", salary: "12-15 LPA", type: "Full-time", posted: "2d ago", applicants: 42, skills: ["React", "Node.js", "AWS"] },
  { id: "2", title: "ML Engineer Intern", company: "AI Labs Research", location: "Remote", salary: "50K/mo", type: "Internship", posted: "5d ago", applicants: 89, skills: ["Python", "PyTorch", "NLP"] },
  { id: "3", title: "Frontend Developer", company: "StartupX", location: "Hyderabad", salary: "8-12 LPA", type: "Full-time", posted: "1d ago", applicants: 28, skills: ["React", "TypeScript", "Figma"] },
  { id: "4", title: "Cloud DevOps Intern", company: "CloudFirst", location: "Pune", salary: "40K/mo", type: "Internship", posted: "3d ago", applicants: 56, skills: ["Docker", "K8s", "AWS"] },
  { id: "5", title: "Blockchain Developer", company: "Web3 Labs", location: "Remote", salary: "15-20 LPA", type: "Full-time", posted: "1w ago", applicants: 34, skills: ["Solidity", "Ethereum", "DeFi"] },
  { id: "6", title: "Data Analyst Intern", company: "DataViz Co.", location: "Mumbai", salary: "35K/mo", type: "Internship", posted: "4d ago", applicants: 67, skills: ["SQL", "Python", "Tableau"] },
];

const topStudents = [
  { name: "Arjun Mehta", dept: "CSE", skills: ["React", "AI/ML"], events: 24, xp: 5240, match: 95 },
  { name: "Priya Sharma", dept: "ECE", skills: ["IoT", "Python"], events: 18, xp: 4890, match: 88 },
  { name: "Rahul Kumar", dept: "IT", skills: ["Node.js", "DevOps"], events: 22, xp: 4560, match: 82 },
  { name: "Sneha Patel", dept: "CSE", skills: ["ML", "Data Science"], events: 15, xp: 4120, match: 79 },
];

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

export default function RecruiterPortalPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <RoleGuard allowedRoles={["recruiter", "super_admin", "college_admin", "student"]}>
      <AppShell>
        <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
          {/* Header */}
          <motion.div variants={stagger.item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold">Recruiter Portal</h1>
              <p className="mt-1 text-sm text-slate">Discover verified talent and post campus opportunities</p>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-neon-purple transition-shadow hover:shadow-[0_0_45px_rgba(139,92,246,0.4)]">
              <Briefcase className="h-4 w-4" /> Post Opportunity
            </button>
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={stagger.item} className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Active Students", value: 12480, icon: Users, color: "text-accent" },
              { label: "Avg Engagement", value: 87, suffix: "%", icon: TrendingUp, color: "text-mint" },
              { label: "NFT Achievements", value: 890, icon: Award, color: "text-purple" },
              { label: "Events This Month", value: 156, icon: Star, color: "text-blaze" },
            ].map((stat) => (
              <GlassCard key={stat.label} className="text-center">
                <stat.icon className={`mx-auto h-6 w-6 ${stat.color}`} />
                <p className={`mt-2 font-heading text-2xl font-bold ${stat.color}`}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-xs text-slate">{stat.label}</p>
              </GlassCard>
            ))}
          </motion.div>

          <Tabs
            tabs={[
              {
                id: "opportunities",
                label: "Opportunities",
                icon: <Briefcase className="h-4 w-4" />,
                content: (
                  <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                      <input
                        type="text"
                        placeholder="Search roles, companies, skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                      />
                    </div>

                    {/* Opportunities */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {opportunities.map((job) => (
                        <GlassCard key={job.id} hover glow="purple">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-heading text-base font-semibold">{job.title}</h3>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate">
                                <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.company}</span>
                                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                                <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.salary}</span>
                              </div>
                            </div>
                            <NeonBadge color={job.type === "Internship" ? "mint" : "blaze"} size="sm">{job.type}</NeonBadge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {job.skills.map((s) => (
                              <span key={s} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate">{s}</span>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate">
                            <span>{job.applicants} applicants · {job.posted}</span>
                            <button className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors">
                              View <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                )
              },
              {
                id: "talent",
                label: "Talent Discovery",
                icon: <Eye className="h-4 w-4" />,
                content: (
                  <div className="space-y-4">
                    <GlassCard variant="subtle" padding="sm">
                      <p className="text-sm text-slate">
                        <span className="text-accent font-semibold">AI-Powered</span> — Students are ranked by verified campus activity, skill assessments, and engagement metrics.
                      </p>
                    </GlassCard>
                    <div className="space-y-3">
                      {topStudents.map((student, i) => (
                        <GlassCard key={i} hover className="flex items-center gap-4">
                          <Avatar name={student.name} size="lg" glow />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{student.name}</h3>
                              <NeonBadge color="cyan" size="sm">{student.dept}</NeonBadge>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {student.skills.map((s) => (
                                <span key={s} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate">{s}</span>
                              ))}
                            </div>
                            <div className="mt-2 flex gap-4 text-xs text-slate">
                              <span>{student.events} events</span>
                              <span>{student.xp} XP</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-heading text-2xl font-bold text-mint">{student.match}%</p>
                            <p className="text-[10px] text-slate">AI Match</p>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                )
              }
            ]}
          />
        </motion.div>
      </AppShell>
    </RoleGuard>
  );
}
