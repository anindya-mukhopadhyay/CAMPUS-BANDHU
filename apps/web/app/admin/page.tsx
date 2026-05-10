"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Calendar, ShoppingBag, Shield,
  Ban, CheckCircle, Eye, Settings,
  FileText, Search
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { RoleGuard } from "@/components/auth/RoleGuard";

const kpis = [
  { label: "Total Users", value: 15840, change: "+12%", icon: Users, color: "text-accent" },
  { label: "Active Events", value: 85, change: "+8%", icon: Calendar, color: "text-mint" },
  { label: "Marketplace Items", value: 2340, change: "+23%", icon: ShoppingBag, color: "text-blaze" },
  { label: "Security Alerts", value: 3, change: "-40%", icon: Shield, color: "text-rose" },
];

const recentUsers = [
  { name: "Arjun Mehta", email: "arjun@campus.edu", role: "student", status: "active", joined: "2d ago" },
  { name: "Dr. Vikram Singh", email: "vikram@campus.edu", role: "faculty", status: "active", joined: "1w ago" },
  { name: "Priya Sharma", email: "priya@campus.edu", role: "organizer", status: "active", joined: "3d ago" },
  { name: "Rahul Kumar", email: "rahul@campus.edu", role: "student", status: "suspended", joined: "2w ago" },
  { name: "Sarah Jenkins", email: "sarah@company.com", role: "recruiter", status: "active", joined: "5d ago" },
];

const pendingEvents = [
  { title: "Blockchain Bootcamp", organizer: "Tech Club", date: "May 20", status: "pending" },
  { title: "Resume Workshop", organizer: "Career Cell", date: "May 22", status: "pending" },
  { title: "Drone Racing", organizer: "Robotics Club", date: "May 25", status: "pending" },
];

const auditLogs = [
  { action: "User banned", target: "spam_user_42", admin: "Super Admin", time: "1h ago", type: "warning" },
  { action: "Event approved", target: "AI Hackathon", admin: "College Admin", time: "3h ago", type: "success" },
  { action: "Listing removed", target: "Suspicious item", admin: "Moderator", time: "5h ago", type: "warning" },
  { action: "Role changed", target: "priya@campus.edu", admin: "Super Admin", time: "1d ago", type: "info" },
];

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

export default function AdminPage() {
  const [userSearch, setUserSearch] = useState("");

  return (
    <RoleGuard allowedRoles={["super_admin", "college_admin"]}>
      <AppShell>
        <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
          {/* Header */}
          <motion.div variants={stagger.item} className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold">Admin Command Center</h1>
              <p className="mt-1 text-sm text-slate">Full platform oversight and management</p>
            </div>
            <NeonBadge color="rose" pulse>
              <Shield className="h-3 w-3" /> Admin Access
            </NeonBadge>
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={stagger.item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <GlassCard key={kpi.label}>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <span className={`text-xs font-semibold ${kpi.change.startsWith("+") ? "text-mint" : "text-rose"}`}>
                    {kpi.change}
                  </span>
                </div>
                <p className={`mt-3 font-heading text-2xl font-bold ${kpi.color}`}>
                  <AnimatedCounter value={kpi.value} />
                </p>
                <p className="text-xs text-slate">{kpi.label}</p>
              </GlassCard>
            ))}
          </motion.div>

          {/* Main Content */}
          <Tabs
            tabs={[
              {
                id: "users",
                label: "Users",
                icon: <Users className="h-4 w-4" />,
                content: (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, role..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                      />
                    </div>
                    <GlassCard padding="sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/[0.06] text-left text-xs text-slate">
                              <th className="pb-3 font-medium">User</th>
                              <th className="pb-3 font-medium">Role</th>
                              <th className="pb-3 font-medium">Status</th>
                              <th className="pb-3 font-medium">Joined</th>
                              <th className="pb-3 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {recentUsers.map((user, i) => (
                              <tr key={i} className="group">
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar name={user.name} size="sm" />
                                    <div>
                                      <p className="font-medium">{user.name}</p>
                                      <p className="text-xs text-slate">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <NeonBadge color={
                                    user.role === "faculty" ? "cyan" :
                                    user.role === "organizer" ? "blaze" :
                                    user.role === "recruiter" ? "purple" : "blue"
                                  } size="sm">
                                    {user.role}
                                  </NeonBadge>
                                </td>
                                <td className="py-3">
                                  <span className={`inline-flex items-center gap-1 text-xs ${
                                    user.status === "active" ? "text-mint" : "text-rose"
                                  }`}>
                                    {user.status === "active" ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                                    {user.status}
                                  </span>
                                </td>
                                <td className="py-3 text-xs text-slate">{user.joined}</td>
                                <td className="py-3 text-right">
                                  <div className="invisible flex justify-end gap-1 group-hover:visible">
                                    <button className="rounded-lg p-1.5 text-slate hover:bg-white/[0.06] hover:text-white"><Eye className="h-3.5 w-3.5" /></button>
                                    <button className="rounded-lg p-1.5 text-slate hover:bg-white/[0.06] hover:text-white"><Settings className="h-3.5 w-3.5" /></button>
                                    <button className="rounded-lg p-1.5 text-slate hover:bg-rose/20 hover:text-rose"><Ban className="h-3.5 w-3.5" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </GlassCard>
                  </div>
                )
              },
              {
                id: "events",
                label: "Event Moderation",
                icon: <Calendar className="h-4 w-4" />,
                content: (
                  <div className="space-y-4">
                    <GlassCard variant="subtle" padding="sm">
                      <p className="text-sm"><span className="font-semibold text-blaze">{pendingEvents.length}</span> events pending approval</p>
                    </GlassCard>
                    {pendingEvents.map((event, i) => (
                      <GlassCard key={i} hover>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="mt-1 text-xs text-slate">By {event.organizer} · {event.date}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 rounded-lg bg-mint/10 px-4 py-2 text-xs font-medium text-mint transition-colors hover:bg-mint/20">
                              <CheckCircle className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button className="flex items-center gap-1.5 rounded-lg bg-rose/10 px-4 py-2 text-xs font-medium text-rose transition-colors hover:bg-rose/20">
                              <Ban className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )
              },
              {
                id: "logs",
                label: "Audit Logs",
                icon: <FileText className="h-4 w-4" />,
                content: (
                  <div className="space-y-2">
                    {auditLogs.map((log, i) => (
                      <GlassCard key={i} padding="sm" variant="subtle">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${
                            log.type === "success" ? "bg-mint" :
                            log.type === "warning" ? "bg-blaze" : "bg-accent"
                          }`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{log.action}</span>
                              <span className="text-slate"> — {log.target}</span>
                            </p>
                            <p className="text-[10px] text-subtle">by {log.admin} · {log.time}</p>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
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
