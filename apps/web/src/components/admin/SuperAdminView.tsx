"use client";

import { useState } from "react";
import {
  Users, Calendar, ShoppingBag, Shield,
  Ban, CheckCircle, Eye, Settings,
  FileText, Search, Building, Cpu
} from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const kpis = [
  { label: "Total Users", value: 15840, change: "+12%", icon: Users, color: "text-accent" },
  { label: "Active Events", value: 85, change: "+8%", icon: Calendar, color: "text-mint" },
  { label: "Marketplace Items", value: 2340, change: "+23%", icon: ShoppingBag, color: "text-blaze" },
  { label: "Security Alerts", value: 3, change: "-40%", icon: Shield, color: "text-rose" },
];

const recentUsers = [
  { name: "Arjun Mehta", email: "arjun@campus.edu", role: "student", status: "active", joined: "2d ago" },
  { name: "Dr. Vikram Singh", email: "vikram@campus.edu", role: "faculty", status: "active", joined: "1w ago" },
  { name: "Priya Sharma", email: "priya@campus.edu", role: "college_admin", status: "active", joined: "3d ago" },
  { name: "Rahul Kumar", email: "rahul@campus.edu", role: "student", status: "suspended", joined: "2w ago" },
];

const pendingEvents = [
  { title: "Global Blockchain Summit", organizer: "NSUT Tech Club", date: "May 20", status: "pending", scope: "Global" },
  { title: "Inter-College Hackathon", organizer: "IIT Delhi", date: "May 22", status: "pending", scope: "Global" },
];

const auditLogs = [
  { action: "User banned", target: "spam_user_42", admin: "Super Admin", time: "1h ago", type: "warning" },
  { action: "College verified", target: "NIT Trichy", admin: "Super Admin", time: "3h ago", type: "success" },
  { action: "AI Rules Updated", target: "Global Filter", admin: "System", time: "5h ago", type: "info" },
];

const colleges = [
  { name: "Netaji Subhas University of Technology", code: "NSUT", users: 4500, status: "active" },
  { name: "Delhi Technological University", code: "DTU", users: 5200, status: "active" },
  { name: "Indraprastha Institute of Information Technology", code: "IIITD", users: 2100, status: "pending" },
];

export function SuperAdminView() {
  const [userSearch, setUserSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

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
                  placeholder="Search globally by name, email, role..."
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
                              user.role === "college_admin" ? "cyan" :
                              user.role === "faculty" ? "purple" : "blue"
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
          id: "colleges",
          label: "Colleges",
          icon: <Building className="h-4 w-4" />,
          content: (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent/90">
                  + Add College
                </button>
              </div>
              <div className="grid gap-4">
                {colleges.map((college, i) => (
                  <GlassCard key={i} hover>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
                          <Building className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{college.name}</h3>
                          <div className="mt-1 flex items-center gap-3 text-xs text-slate">
                            <span>{college.code}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {college.users} users</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {college.status === "active" ? (
                          <NeonBadge color="mint" size="sm">Verified</NeonBadge>
                        ) : (
                          <button className="rounded-lg bg-mint/10 px-4 py-2 text-xs font-medium text-mint transition-colors hover:bg-mint/20">
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )
        },
        {
          id: "events",
          label: "Global Events",
          icon: <Calendar className="h-4 w-4" />,
          content: (
            <div className="space-y-4">
              <GlassCard variant="subtle" padding="sm">
                <p className="text-sm"><span className="font-semibold text-blaze">{pendingEvents.length}</span> global events pending approval</p>
              </GlassCard>
              {pendingEvents.map((event, i) => (
                <GlassCard key={i} hover>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="mt-1 text-xs text-slate">By {event.organizer} · {event.date} · {event.scope}</p>
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
          id: "ai",
          label: "AI Controls",
          icon: <Cpu className="h-4 w-4" />,
          content: (
            <div className="grid gap-6 md:grid-cols-2">
              <GlassCard>
                <h3 className="mb-4 font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /> Auto-Moderation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Toxicity Filter</p>
                      <p className="text-xs text-slate">AI blocks offensive content</p>
                    </div>
                    <div className="h-6 w-10 rounded-full bg-mint/20 relative cursor-pointer">
                      <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-mint shadow-md" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Marketplace Spam Filter</p>
                      <p className="text-xs text-slate">Auto-flags duplicate listings</p>
                    </div>
                    <div className="h-6 w-10 rounded-full bg-mint/20 relative cursor-pointer">
                      <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-mint shadow-md" />
                    </div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard>
                <h3 className="mb-4 font-semibold flex items-center gap-2"><Cpu className="h-4 w-4 text-purple" /> Copilot Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Context Awareness</p>
                      <p className="text-xs text-slate">AI reads campus event data</p>
                    </div>
                    <div className="h-6 w-10 rounded-full bg-mint/20 relative cursor-pointer">
                      <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-mint shadow-md" />
                    </div>
                  </div>
                </div>
              </GlassCard>
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
    </div>
  );
}
