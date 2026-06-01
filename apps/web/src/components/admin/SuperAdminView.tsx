"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services";
import { toast } from "@/components/ui/toast";
import {
  Users, Calendar, ShoppingBag, Shield,
  Ban, CheckCircle, XCircle, Plus,
  FileText, Search, Building, Cpu, Loader2
} from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function SuperAdminView() {
  const [users, setUsers] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [aiControls, setAiControls] = useState({
    toxicityFilter: true,
    marketplaceSpamFilter: true,
    contextAwareness: true
  });

  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalEvents: 0,
    activeListings: 0
  });

  const [userSearch, setUserSearch] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");

  // Modal State
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCollegeCode, setNewCollegeCode] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await adminService.getColleges();
      setColleges(res.data || []);
    } catch (err) {
      console.error("Failed to fetch colleges:", err);
    }
  };

  const fetchPendingEvents = async () => {
    try {
      const res = await adminService.getPendingEvents();
      setPendingEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending events:", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await adminService.getAuditLogs();
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await adminService.getSettings("ai_controls");
      if (res.data?.value) {
        setAiControls(res.data.value);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await adminService.getAnalytics();
      if (res.data) {
        setAnalytics({
          totalUsers: res.data.totalUsers || 0,
          totalEvents: res.data.totalEvents || 0,
          activeListings: res.data.activeListings || 0
        });
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchColleges(),
      fetchPendingEvents(),
      fetchAuditLogs(),
      fetchSettings(),
      fetchAnalytics()
    ]);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUserAction = async (uid: string, action: "approve" | "reject" | "ban" | "unban") => {
    try {
      await adminService.moderateUser(uid, action);
      toast({ title: `User successfully ${action}ed.`, type: "success" });
      await Promise.all([fetchUsers(), fetchAuditLogs()]);
    } catch (err: any) {
      toast({ title: err.message || "Failed to moderate user.", type: "error" });
    }
  };

  const handleCollegeAction = async (code: string, action: "approve" | "reject") => {
    try {
      await adminService.moderateCollege(code, action);
      toast({ title: `College successfully ${action === "approve" ? "verified" : "removed"}.`, type: "success" });
      await Promise.all([fetchColleges(), fetchAuditLogs()]);
    } catch (err: any) {
      toast({ title: err.message || "Failed to moderate college.", type: "error" });
    }
  };

  const handleEventAction = async (eventId: string, action: "approve" | "reject") => {
    try {
      await adminService.moderateEvent(eventId, action);
      toast({ title: `Global event successfully ${action}ed.`, type: "success" });
      await Promise.all([fetchPendingEvents(), fetchAuditLogs(), fetchAnalytics()]);
    } catch (err: any) {
      toast({ title: err.message || "Failed to moderate event.", type: "error" });
    }
  };

  const handleToggleAiControl = async (toggleKey: keyof typeof aiControls) => {
    const updatedControls = {
      ...aiControls,
      [toggleKey]: !aiControls[toggleKey]
    };
    
    // Optimistic UI state update
    setAiControls(updatedControls);

    try {
      await adminService.updateSettings("ai_controls", updatedControls);
      toast({ title: "AI Controls configuration saved.", type: "success" });
      await fetchAuditLogs();
    } catch (err: any) {
      // Revert state
      setAiControls(aiControls);
      toast({ title: err.message || "Failed to update AI settings.", type: "error" });
    }
  };

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newCollegeName.trim() || !newCollegeCode.trim()) {
      setModalError("Please enter both College Name and Code.");
      return;
    }

    if (newCollegeCode.length < 2 || newCollegeCode.length > 10) {
      setModalError("College Code must be between 2 and 10 characters.");
      return;
    }

    setModalLoading(true);
    try {
      await adminService.createCollege({
        name: newCollegeName.trim(),
        code: newCollegeCode.trim().toUpperCase()
      });
      toast({ title: "College created and pending verification.", type: "success" });
      
      // Reset Modal States
      setNewCollegeName("");
      setNewCollegeCode("");
      setIsAddCollegeOpen(false);
      
      // Refresh Lists
      await Promise.all([fetchColleges(), fetchAuditLogs()]);
    } catch (err: any) {
      setModalError(err.message || "Failed to create college.");
    } finally {
      setModalLoading(false);
    }
  };

  const kpis = [
    { label: "Total Users", value: analytics.totalUsers, change: "+12%", icon: Users, color: "text-accent" },
    { label: "Active Events", value: analytics.totalEvents, change: "+8%", icon: Calendar, color: "text-mint" },
    { label: "Marketplace Items", value: analytics.activeListings, change: "+23%", icon: ShoppingBag, color: "text-blaze" },
    { label: "Security Alerts", value: 3, change: "-40%", icon: Shield, color: "text-rose" },
  ];

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
                        {users
                          .filter((u) =>
                            (u.fullName || "").toLowerCase().includes(userSearch.toLowerCase()) ||
                            (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
                            (u.role || "").toLowerCase().includes(userSearch.toLowerCase())
                          )
                          .map((u) => (
                            <tr key={u.uid} className="group">
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar name={u.fullName || "User"} size="sm" />
                                  <div>
                                    <p className="font-medium">{u.fullName || "Unnamed User"}</p>
                                    <p className="text-xs text-slate">{u.email || "No email"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <NeonBadge color={
                                  u.role === "super_admin" ? "rose" :
                                  u.role === "college_admin" ? "purple" :
                                  u.role === "recruiter" ? "cyan" : "blue"
                                } size="sm">
                                  {u.role}
                                </NeonBadge>
                              </td>
                              <td className="py-3">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                  u.status === "active" ? "text-mint" :
                                  u.status === "pending" ? "text-accent" : "text-rose"
                                }`}>
                                  {u.status === "active" ? (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  ) : u.status === "pending" ? (
                                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                                  ) : (
                                    <Ban className="h-3.5 w-3.5" />
                                  )}
                                  {u.status}
                                </span>
                              </td>
                              <td className="py-3 text-xs text-slate">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {u.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => handleUserAction(u.uid, "approve")}
                                        className="rounded-lg bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint hover:bg-mint/20 transition-colors"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleUserAction(u.uid, "reject")}
                                        className="rounded-lg bg-rose/10 px-3 py-1.5 text-xs font-semibold text-rose hover:bg-rose/20 transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {u.status === "active" && u.role !== "super_admin" && (
                                    <button
                                      onClick={() => handleUserAction(u.uid, "ban")}
                                      className="rounded-lg bg-rose/10 px-3 py-1.5 text-xs font-semibold text-rose hover:bg-rose/20 transition-colors"
                                    >
                                      Ban
                                    </button>
                                  )}
                                  {u.status === "banned" && (
                                    <button
                                      onClick={() => handleUserAction(u.uid, "unban")}
                                      className="rounded-lg bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint hover:bg-mint/20 transition-colors"
                                    >
                                      Unban
                                    </button>
                                  )}
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
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                    <input
                      type="text"
                      placeholder="Search colleges by name or code..."
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 pl-10 pr-4 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddCollegeOpen(true)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent/90"
                  >
                    <Plus className="h-4 w-4" /> Add College
                  </button>
                </div>
                <div className="grid gap-4">
                  {colleges
                    .filter((c) =>
                      (c.name || "").toLowerCase().includes(collegeSearch.toLowerCase()) ||
                      (c.code || "").toLowerCase().includes(collegeSearch.toLowerCase())
                    )
                    .map((college, i) => (
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
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" /> {college.users} user(s)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {college.status === "active" ? (
                              <NeonBadge color="mint" size="sm">Verified</NeonBadge>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleCollegeAction(college.code, "approve")}
                                  className="rounded-lg bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint hover:bg-mint/20 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleCollegeAction(college.code, "reject")}
                                  className="rounded-lg bg-rose/10 px-3 py-1.5 text-xs font-semibold text-rose hover:bg-rose/20 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  {colleges.length === 0 && (
                    <p className="text-center py-6 text-slate text-sm">No registered colleges found.</p>
                  )}
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
                  <p className="text-sm">
                    <span className="font-semibold text-blaze">{pendingEvents.length}</span> global events pending approval
                  </p>
                </GlassCard>
                {pendingEvents.map((event, i) => (
                  <GlassCard key={i} hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="mt-1 text-xs text-slate">
                          By {event.organizerName || "Organizer"} · {event.date ? new Date(event.date).toLocaleDateString() : "TBD"} · {event.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEventAction(event.id, "approve")}
                          className="flex items-center gap-1.5 rounded-lg bg-mint/10 px-4 py-2 text-xs font-medium text-mint transition-colors hover:bg-mint/20"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleEventAction(event.id, "reject")}
                          className="flex items-center gap-1.5 rounded-lg bg-rose/10 px-4 py-2 text-xs font-medium text-rose transition-colors hover:bg-rose/20"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
                {pendingEvents.length === 0 && (
                  <p className="text-center py-6 text-slate text-sm">No pending global events.</p>
                )}
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
                  <h3 className="mb-4 font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" /> Auto-Moderation
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Toxicity Filter</p>
                        <p className="text-xs text-slate">AI blocks offensive content</p>
                      </div>
                      <div
                        onClick={() => handleToggleAiControl("toxicityFilter")}
                        className={`h-6 w-10 rounded-full relative cursor-pointer transition-colors duration-200 ${
                          aiControls.toxicityFilter ? "bg-mint/20" : "bg-white/[0.06]"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-4 w-4 rounded-full shadow-md transition-all duration-200 ${
                            aiControls.toxicityFilter ? "right-1 bg-mint" : "left-1 bg-slate"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Marketplace Spam Filter</p>
                        <p className="text-xs text-slate">Auto-flags duplicate listings</p>
                      </div>
                      <div
                        onClick={() => handleToggleAiControl("marketplaceSpamFilter")}
                        className={`h-6 w-10 rounded-full relative cursor-pointer transition-colors duration-200 ${
                          aiControls.marketplaceSpamFilter ? "bg-mint/20" : "bg-white/[0.06]"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-4 w-4 rounded-full shadow-md transition-all duration-200 ${
                            aiControls.marketplaceSpamFilter ? "right-1 bg-mint" : "left-1 bg-slate"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard>
                  <h3 className="mb-4 font-semibold flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-purple" /> Copilot Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Context Awareness</p>
                        <p className="text-xs text-slate">AI reads campus event data</p>
                      </div>
                      <div
                        onClick={() => handleToggleAiControl("contextAwareness")}
                        className={`h-6 w-10 rounded-full relative cursor-pointer transition-colors duration-200 ${
                          aiControls.contextAwareness ? "bg-mint/20" : "bg-white/[0.06]"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-4 w-4 rounded-full shadow-md transition-all duration-200 ${
                            aiControls.contextAwareness ? "right-1 bg-mint" : "left-1 bg-slate"
                          }`}
                        />
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
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {auditLogs.map((log, i) => (
                  <GlassCard key={i} padding="sm" variant="subtle">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        log.type === "success" ? "bg-mint" :
                        log.type === "warning" ? "bg-rose" : "bg-accent"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-slate"> — {log.target}</span>
                        </p>
                        <p className="text-[10px] text-subtle">
                          by {log.admin} · {log.time}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-center py-6 text-slate text-sm">No audit logs recorded yet.</p>
                )}
              </div>
            )
          }
        ]}
      />

      {/* Add College Modal Dialog */}
      {isAddCollegeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <GlassCard className="max-w-md w-full relative shadow-glow" padding="lg">
            <h3 className="font-heading text-xl font-bold flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-accent" /> Add Institutional College
            </h3>
            <p className="text-xs text-slate mb-6">
              Create a new campus portal entry. Newly added colleges start as "pending" until approved.
            </p>

            <form onSubmit={handleAddCollege} className="space-y-4">
              {modalError && (
                <div className="rounded-xl bg-rose/15 p-3 text-xs text-rose border border-rose/10">
                  {modalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">College Name</label>
                <input
                  type="text"
                  placeholder="e.g. Netaji Subhas University of Technology"
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  disabled={modalLoading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Unique College Code</label>
                <input
                  type="text"
                  placeholder="e.g. NSUT"
                  value={newCollegeCode}
                  onChange={(e) => setNewCollegeCode(e.target.value)}
                  disabled={modalLoading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCollegeOpen(false);
                    setNewCollegeName("");
                    setNewCollegeCode("");
                    setModalError(null);
                  }}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl text-sm text-slate hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent/90 transition-colors disabled:opacity-55"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save College"
                  )}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
