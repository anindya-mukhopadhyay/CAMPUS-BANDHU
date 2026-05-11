"use client";

import { useState } from "react";
import {
  Users, Calendar, GraduationCap, Building2,
  CheckCircle, Ban, BookOpen
} from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Tabs } from "@/components/ui/tabs";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { CreateEventModal } from "@/components/events/CreateEventModal";

const departmentsMap: Record<string, any[]> = {
  "NSUT": [
    { name: "Computer Science", hod: "Dr. A. Sharma", students: 1200, status: "active" },
    { name: "Electronics", hod: "Dr. S. Verma", students: 850, status: "active" },
    { name: "Information Tech", hod: "Pending", students: 400, status: "setup_required" },
  ],
  "IITD": [
    { name: "Mechanical Eng", hod: "Dr. R. Kapoor", students: 950, status: "active" },
    { name: "Civil Eng", hod: "Dr. M. Gupta", students: 600, status: "active" },
    { name: "Biotech", hod: "Dr. P. Roy", students: 300, status: "active" },
  ]
};

const collegeKpisMap: Record<string, any[]> = {
  "NSUT": [
    { label: "Total Students", value: 4500, change: "+5%", icon: Users, color: "text-accent" },
    { label: "Active Clubs", value: 34, change: "+2", icon: Building2, color: "text-purple" },
    { label: "Upcoming Events", value: 12, change: "+4", icon: Calendar, color: "text-mint" },
    { label: "Placements (%)", value: 92, change: "+1%", icon: GraduationCap, color: "text-blaze" },
  ],
  "IITD": [
    { label: "Total Students", value: 8200, change: "+3%", icon: Users, color: "text-accent" },
    { label: "Active Clubs", value: 56, change: "+8", icon: Building2, color: "text-purple" },
    { label: "Upcoming Events", value: 24, change: "+12", icon: Calendar, color: "text-mint" },
    { label: "Placements (%)", value: 98, change: "+2%", icon: GraduationCap, color: "text-blaze" },
  ]
};

const pendingClubs = [
  { name: "Web3 Builders", category: "Technical", founder: "Arjun M.", studentsInterested: 120, status: "pending" },
  { name: "Campus Debate", category: "Cultural", founder: "Priya S.", studentsInterested: 85, status: "pending" },
];

const pendingEvents = [
  { title: "HackTheCampus 2026", organizer: "Tech Club", date: "June 10", status: "pending" },
  { title: "Annual Cultural Fest", organizer: "Student Council", date: "Oct 15", status: "pending" },
];

export function CollegeAdminView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { profile } = useAuthStore();
  const collegeId = profile?.collegeId || "NSUT";

  const departments = departmentsMap[collegeId] || departmentsMap["NSUT"] || [];
  const collegeKpis = collegeKpisMap[collegeId] || collegeKpisMap["NSUT"] || [];
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
                  <button className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent/90">
                    + Add Department
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {departments.map((dept, i) => (
                    <GlassCard key={i} hover>
                      <h3 className="font-semibold">{dept.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-slate">
                        <p>HOD: <span className="text-white">{dept.hod}</span></p>
                        <p>Students: <span className="text-white">{dept.students}</span></p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        {dept.status === "active" ? (
                          <NeonBadge color="mint" size="sm">Active</NeonBadge>
                        ) : (
                          <NeonBadge color="rose" size="sm">Setup Required</NeonBadge>
                        )}
                        <button className="text-xs font-medium text-accent hover:underline">Edit</button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: "clubs",
            label: "Club Approvals",
            icon: <Users className="h-4 w-4" />,
            content: (
              <div className="space-y-4">
                {pendingClubs.map((club, i) => (
                  <GlassCard key={i} hover>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {club.name}
                          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate">{club.category}</span>
                        </h3>
                        <p className="mt-1 text-xs text-slate">Founder: {club.founder} · {club.studentsInterested} interested students</p>
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
                {pendingClubs.length === 0 && (
                  <div className="py-8 text-center text-slate">No pending club requests.</div>
                )}
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
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-electric px-4 py-2 text-sm font-semibold text-white shadow-glow-sm hover:shadow-neon"
                  >
                    + Create Event
                  </button>
                </div>
                {pendingEvents.map((event, i) => (
                  <GlassCard key={i} hover>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="mt-1 text-xs text-slate">Organized by {event.organizer} · Date: {event.date}</p>
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
          }
        ]}
      />
      <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
