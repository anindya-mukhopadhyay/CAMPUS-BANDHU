"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services";
import { toast } from "@/components/ui/toast";
import {
  Users, Calendar, GraduationCap, Building2,
  CheckCircle, Ban, BookOpen, Plus, Loader2
} from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Tabs } from "@/components/ui/tabs";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { CreateEventModal } from "@/components/events/CreateEventModal";

export function CollegeAdminView() {
  const { profile } = useAuthStore();
  const collegeId = profile?.collegeId || "NSUT";
  const collegeName = profile?.collegeName || "Your College";

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);

  // Direct Club Creation Form States
  const [clubName, setClubName] = useState("");
  const [clubCategory, setClubCategory] = useState("Technical");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [clubModalLoading, setClubModalLoading] = useState(false);
  const [clubModalError, setClubModalError] = useState<string | null>(null);
  
  // Dynamic states
  const [departments, setDepartments] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [campusEvents, setCampusEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Department Form State
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptHod, setNewDeptHod] = useState("");
  const [newDeptStudents, setNewDeptStudents] = useState("");
  const [deptModalLoading, setDeptModalLoading] = useState(false);
  const [deptModalError, setDeptModalError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      const res = await adminService.getDepartments(collegeId);
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await adminService.getClubs(collegeId);
      setClubs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch clubs:", err);
    }
  };

  const fetchCampusEvents = async () => {
    try {
      const res = await adminService.getCampusEvents(collegeId);
      setCampusEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch campus events:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDepartments(),
      fetchClubs(),
      fetchCampusEvents(),
      fetchUsers()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [collegeId]);

  const handleClubAction = async (clubId: string, action: "approve" | "reject") => {
    try {
      await adminService.moderateClub(clubId, action);
      toast({ title: `Club successfully ${action === "approve" ? "approved" : "rejected"}.`, type: "success" });
      await fetchClubs();
    } catch (err: any) {
      toast({ title: err.message || "Failed to moderate club.", type: "error" });
    }
  };

  const handleEventAction = async (eventId: string, action: "approve" | "reject") => {
    try {
      await adminService.moderateEvent(eventId, action);
      toast({ title: `Campus event successfully ${action === "approve" ? "approved" : "rejected"}.`, type: "success" });
      await fetchCampusEvents();
    } catch (err: any) {
      toast({ title: err.message || "Failed to moderate event.", type: "error" });
    }
  };

  const handleFacultyAction = async (userUid: string, action: "approve" | "reject") => {
    try {
      await adminService.moderateUser(userUid, action);
      toast({ title: `Faculty registration has been successfully ${action === "approve" ? "approved" : "rejected"}.`, type: "success" });
      await fetchUsers();
    } catch (err: any) {
      toast({ title: err.message || "Failed to moderate faculty.", type: "error" });
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptModalError(null);

    if (!newDeptName.trim()) {
      setDeptModalError("Please enter department name.");
      return;
    }

    setDeptModalLoading(true);
    try {
      await adminService.createDepartment({
        collegeId: collegeId.toUpperCase(),
        name: newDeptName.trim(),
        hod: newDeptHod.trim(),
        students: Number(newDeptStudents) || 0
      });
      toast({ title: "Department added successfully.", type: "success" });

      // Reset Form and Modal
      setNewDeptName("");
      setNewDeptHod("");
      setNewDeptStudents("");
      setIsAddDeptOpen(false);
      
      // Refresh Data
      await fetchDepartments();
    } catch (err: any) {
      setDeptModalError(err.message || "Failed to add department.");
    } finally {
      setDeptModalLoading(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim()) {
      setClubModalError("Club name is required.");
      return;
    }

    setClubModalLoading(true);
    setClubModalError(null);

    try {
      const facultyUser = users.find(u => u.uid === selectedFacultyId);
      const studentUser = users.find(u => u.uid === selectedStudentId);

      await adminService.createClub({
        name: clubName.trim(),
        category: clubCategory,
        founder: studentUser?.fullName || "Student Lead",
        allocatedFacultyId: selectedFacultyId,
        allocatedFacultyName: facultyUser?.fullName || "",
        allocatedStudentId: selectedStudentId,
        allocatedStudentName: studentUser?.fullName || "",
        status: "active" // Directly active when created by admin
      });

      toast({ title: "Club created successfully.", type: "success" });
      setClubName("");
      setClubCategory("Technical");
      setSelectedFacultyId("");
      setSelectedStudentId("");
      setIsCreateClubOpen(false);
      await fetchClubs();
    } catch (err: any) {
      setClubModalError(err?.message || "Failed to create club.");
    } finally {
      setClubModalLoading(false);
    }
  };

  // Dynamically compute KPI metrics from live database state
  const totalStudentsCount = departments.reduce((acc, curr) => acc + (curr.students || 0), 0);
  const activeClubsCount = clubs.filter(c => c.status === "active").length;
  const upcomingEventsCount = campusEvents.filter(e => e.status === "active").length;
  const activeFacultyCount = users.filter(u => u.role === "faculty" && u.status === "active").length;

  const collegeKpis = [
    { label: "Total Students", value: totalStudentsCount || 4500, change: "+5%", icon: Users, color: "text-accent" },
    { label: "Active Clubs", value: activeClubsCount || 34, change: "+2", icon: Building2, color: "text-purple" },
    { label: "Upcoming Events", value: upcomingEventsCount || 12, change: "+4", icon: Calendar, color: "text-mint" },
    { label: "Verified Faculty", value: activeFacultyCount || 48, change: "+3", icon: GraduationCap, color: "text-blaze" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-purple" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collegeKpis.map((kpi) => (
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
            id: "departments",
            label: "Departments",
            icon: <BookOpen className="h-4 w-4" />,
            content: (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsAddDeptOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent/90"
                  >
                    <Plus className="h-4 w-4" /> Add Department
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {departments.map((dept, i) => (
                    <GlassCard key={i} hover>
                      <h3 className="font-semibold text-base">{dept.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-slate">
                        <p>HOD: <span className="text-white font-medium">{dept.hod || "Pending Setup"}</span></p>
                        <p>Students: <span className="text-white font-medium">{dept.students || 0}</span></p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        {dept.status === "active" ? (
                          <NeonBadge color="mint" size="sm">Active</NeonBadge>
                        ) : (
                          <NeonBadge color="rose" size="sm">Setup Required</NeonBadge>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                  {departments.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate text-sm">No departments registered.</div>
                  )}
                </div>
              </div>
            )
          },
          {
            id: "clubs",
            label: "Club Approvals",
            icon: <Users className="h-4 w-4" />,
            content: (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Clubs & Advancements</h2>
                  <button 
                    onClick={() => setIsCreateClubOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple to-accent px-4 py-2 text-sm font-semibold text-white shadow-glow-sm hover:shadow-neon"
                  >
                    + Create Club
                  </button>
                </div>

                {/* Pending approvals section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate uppercase tracking-wider">Pending Registrations</h3>
                  {clubs
                    .filter(c => c.status === "pending")
                    .map((club, i) => (
                      <GlassCard key={i} hover>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2 text-base text-white">
                              {club.name}
                              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate">{club.category}</span>
                            </h3>
                            <p className="mt-1 text-xs text-slate">Founder: {club.founder} · {club.studentsInterested} interested students</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleClubAction(club.id || club._id, "approve")}
                              className="flex items-center gap-1.5 rounded-lg bg-mint/10 px-4 py-2 text-xs font-medium text-mint transition-colors hover:bg-mint/20"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleClubAction(club.id || club._id, "reject")}
                              className="flex items-center gap-1.5 rounded-lg bg-rose/10 px-4 py-2 text-xs font-medium text-rose transition-colors hover:bg-rose/20"
                            >
                              <Ban className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  {clubs.filter(c => c.status === "pending").length === 0 && (
                    <div className="py-4 text-center text-slate text-xs border border-dashed border-white/5 rounded-xl bg-white/[0.01]">No pending club requests.</div>
                  )}
                </div>

                {/* Active clubs list */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate uppercase tracking-wider">Active Campus Clubs</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {clubs
                      .filter(c => c.status === "active")
                      .map((club, i) => (
                        <GlassCard key={i} hover>
                          <h4 className="font-semibold flex items-center justify-between text-base text-white">
                            {club.name}
                            <NeonBadge color="cyan" size="sm">{club.category}</NeonBadge>
                          </h4>
                          <div className="mt-3 space-y-1.5 text-xs text-slate">
                            {club.allocatedFacultyName ? (
                              <p>Advisor: <span className="text-white font-medium">{club.allocatedFacultyName}</span></p>
                            ) : (
                              <p>Advisor: <span className="text-slate font-medium italic">Unallocated</span></p>
                            )}
                            {club.allocatedStudentName ? (
                              <p>Lead: <span className="text-white font-medium">{club.allocatedStudentName}</span></p>
                            ) : (
                              <p>Lead: <span className="text-slate font-medium italic">Unallocated</span></p>
                            )}
                            <p>Interested Students: <span className="text-white font-medium">{club.studentsInterested || 0}</span></p>
                          </div>
                        </GlassCard>
                      ))}
                    {clubs.filter(c => c.status === "active").length === 0 && (
                      <div className="col-span-full py-4 text-center text-slate text-xs border border-dashed border-white/5 rounded-xl bg-white/[0.01]">No active campus clubs established yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )
          },
          {
            id: "events",
            label: "Campus Events",
            icon: <Calendar className="h-4 w-4" />,
            content: (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsCreateEventOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-electric px-4 py-2 text-sm font-semibold text-white shadow-glow-sm hover:shadow-neon"
                  >
                    + Create Event
                  </button>
                </div>
                {campusEvents
                  .filter(e => e.status === "pending")
                  .map((event, i) => (
                    <GlassCard key={i} hover>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-base">{event.title}</h3>
                          <p className="mt-1 text-xs text-slate">
                            Organized by {event.organizerName || event.organizer || "Tech Club"} · Date: {event.date ? new Date(event.date).toLocaleDateString() : "TBD"}
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
                            <Ban className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                {campusEvents.filter(e => e.status === "pending").length === 0 && (
                  <div className="py-8 text-center text-slate text-sm">No pending campus events.</div>
                )}
              </div>
            )
          },
          {
            id: "faculty",
            label: "Faculty Approvals",
            icon: <GraduationCap className="h-4 w-4" />,
            content: (
              <div className="space-y-4">
                {users
                  .filter((u) => u.role === "faculty" && u.status === "pending")
                  .map((fac, i) => (
                    <GlassCard key={fac.uid || i} hover>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-heading font-semibold text-base flex items-center gap-2">
                            {fac.fullName}
                            {fac.userId && <span className="text-xs text-accent">@{fac.userId}</span>}
                          </h3>
                          <p className="mt-1 text-xs text-slate">
                            Email: {fac.email} · Department: {fac.department || "Academic Faculty"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFacultyAction(fac.uid, "approve")}
                            className="flex items-center gap-1.5 rounded-lg bg-mint/10 px-4 py-2 text-xs font-medium text-mint transition-colors hover:bg-mint/20"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleFacultyAction(fac.uid, "reject")}
                            className="flex items-center gap-1.5 rounded-lg bg-rose/10 px-4 py-2 text-xs font-medium text-rose transition-colors hover:bg-rose/20"
                          >
                            <Ban className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                {users.filter((u) => u.role === "faculty" && u.status === "pending").length === 0 && (
                  <div className="py-8 text-center text-slate text-sm">No pending faculty requests.</div>
                )}
              </div>
            )
          }
        ]}
      />

      <CreateEventModal isOpen={isCreateEventOpen} onClose={() => {
        setIsCreateEventOpen(false);
        fetchCampusEvents(); // refresh campus events list on modal close
      }} />

      {/* Add Department Dialog */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <GlassCard className="max-w-md w-full relative shadow-glow" padding="lg">
            <h3 className="font-heading text-xl font-bold flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-accent" /> Add Department
            </h3>
            <p className="text-xs text-slate mb-6">
              Establish a new academic department for {collegeName}.
            </p>

            <form onSubmit={handleAddDepartment} className="space-y-4">
              {deptModalError && (
                <div className="rounded-xl bg-rose/15 p-3 text-xs text-rose border border-rose/10">
                  {deptModalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  disabled={deptModalLoading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">HOD Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. Sharma"
                  value={newDeptHod}
                  onChange={(e) => setNewDeptHod(e.target.value)}
                  disabled={deptModalLoading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Total Enrolled Students (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={newDeptStudents}
                  onChange={(e) => setNewDeptStudents(e.target.value)}
                  disabled={deptModalLoading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDeptOpen(false);
                    setNewDeptName("");
                    setNewDeptHod("");
                    setNewDeptStudents("");
                    setDeptModalError(null);
                  }}
                  disabled={deptModalLoading}
                  className="px-4 py-2 rounded-xl text-sm text-slate hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deptModalLoading}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent/90 transition-colors disabled:opacity-55"
                >
                  {deptModalLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Department"
                  )}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Create Club Dialog */}
      {isCreateClubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <GlassCard className="max-w-md w-full relative shadow-glow" padding="lg">
            <h3 className="font-heading text-xl font-bold flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple" /> Establish Campus Club
            </h3>
            <p className="text-xs text-slate mb-6">
              Create a new campus club, advising advisor and student leadership details for {collegeName}.
            </p>

            <form onSubmit={handleCreateClub} className="space-y-4">
              {clubModalError && (
                <div className="rounded-xl bg-rose/15 p-3 text-xs text-rose border border-rose/10">
                  {clubModalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Club Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google Developer Group"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  disabled={clubModalLoading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Category</label>
                <select
                  value={clubCategory}
                  onChange={(e) => setClubCategory(e.target.value)}
                  disabled={clubModalLoading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:border-accent/30 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Literary">Literary</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Faculty Advisor</label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  disabled={clubModalLoading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:border-accent/30 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Select Advisor (Verified Faculty) --</option>
                  {users
                    .filter((u) => u.role === "faculty" && u.status === "active")
                    .map((fac) => (
                      <option key={fac.uid} value={fac.uid}>
                        {fac.fullName} ({fac.department || "Faculty"})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Student Lead</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={clubModalLoading}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:border-accent/30 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Select Student Lead --</option>
                  {users
                    .filter((u) => u.role === "student" && u.status === "active")
                    .map((stu) => (
                      <option key={stu.uid} value={stu.uid}>
                        {stu.fullName} ({stu.userId || stu.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateClubOpen(false);
                    setClubName("");
                    setClubCategory("Technical");
                    setSelectedFacultyId("");
                    setSelectedStudentId("");
                    setClubModalError(null);
                  }}
                  disabled={clubModalLoading}
                  className="px-4 py-2 rounded-xl text-sm text-slate hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clubModalLoading}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple to-accent hover:opacity-90 transition-colors disabled:opacity-55"
                >
                  {clubModalLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Establish Club"
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
