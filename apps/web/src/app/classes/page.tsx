"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, FileText, Loader2, GraduationCap, Download, Lock, Search
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { facultyService } from "@/services";
import { toast } from "@/components/ui/toast";

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

export default function StudentClassesPage() {
  const { user, profile } = useAuthStore();
  const studentUid = user?.uid;
  const collegeName = profile?.collegeName || "Your Institution";

  // Data States
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [classNotes, setClassNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await facultyService.getStudentClasses();
      setClasses(res.data || []);
    } catch (err) {
      console.error("Failed to load student classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentUid) {
      loadClasses();
    }
  }, [studentUid]);

  // Check if student is registered in a class
  const isRegistered = (cls: any) => {
    return cls.registeredStudentIds?.includes(studentUid);
  };

  const handleClassSelect = async (cls: any) => {
    setSelectedClass(cls);
    
    // Only load student roster and notes if they are registered!
    if (isRegistered(cls)) {
      setNotesLoading(true);
      try {
        const [studentsRes, notesRes] = await Promise.all([
          facultyService.getClassStudents(cls._id || cls.id),
          facultyService.getClassNotes(cls._id || cls.id)
        ]);
        setClassStudents(studentsRes.data || []);
        setClassNotes(notesRes.data || []);
      } catch (err) {
        console.error("Failed to load class details:", err);
      } finally {
        setNotesLoading(false);
      }
    } else {
      setClassStudents([]);
      setClassNotes([]);
    }
  };

  const handleJoinClass = async (cls: any) => {
    if (!studentUid) return;
    setJoinLoading(true);
    try {
      await facultyService.joinClass(cls._id || cls.id);
      toast({ title: `Successfully joined ${cls.code}! Welcome to the classroom.`, type: "success" });
      
      // Reload classes list to fetch new registrations
      const res = await facultyService.getStudentClasses();
      const updatedClasses = res.data || [];
      setClasses(updatedClasses);

      // Find the updated class object in the new list to refresh the UI workspace
      const freshClass = updatedClasses.find((c: any) => (c._id || c.id) === (cls._id || cls.id));
      if (freshClass) {
        await handleClassSelect(freshClass);
      }
    } catch (err: any) {
      toast({ title: err?.message || "Failed to join classroom.", type: "error" });
    } finally {
      setJoinLoading(false);
    }
  };

  // Filter classrooms by Search Query
  const filteredClasses = classes.filter((cls) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      cls.name.toLowerCase().includes(query) ||
      cls.code.toLowerCase().includes(query) ||
      cls.department.toLowerCase().includes(query) ||
      cls.teacherName.toLowerCase().includes(query)
    );
  });

  const myClasses = filteredClasses.filter((cls) => isRegistered(cls));
  const exploreClasses = filteredClasses.filter((cls) => !isRegistered(cls));

  return (
    <RoleGuard allowedRoles={["student", "super_admin"]}>
      <AppShell>
        <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
          {/* Header */}
          <motion.div variants={stagger.item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-3xl font-bold text-white">Academics</h1>
                <NeonBadge color="cyan" size="md">Open Classroom</NeonBadge>
              </div>
              <p className="mt-1 text-sm text-slate">
                Browse and register for institutional classrooms, access lecture summaries, and download shared study materials at {collegeName}.
              </p>
            </div>
          </motion.div>

          {/* Search bar */}
          <motion.div variants={stagger.item} className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Search className="h-4 w-4 text-slate" />
            </span>
            <input
              type="text"
              placeholder="Search by course name, code, department, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
            />
          </motion.div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Left Column: Classroom Listings */}
              <div className="space-y-5 md:col-span-1">
                {/* 1. Joined Classes */}
                <div>
                  <h2 className="text-xs font-bold text-slate uppercase tracking-wider mb-2.5">My Classrooms ({myClasses.length})</h2>
                  <div className="space-y-2.5">
                    {myClasses.map((cls) => {
                      const isActive = selectedClass && (selectedClass._id === cls._id || selectedClass.id === cls.id);
                      return (
                        <div 
                          key={cls._id || cls.id}
                          onClick={() => handleClassSelect(cls)}
                          className={`group relative flex items-center justify-between rounded-2xl p-4 border transition-all duration-300 cursor-pointer ${
                            isActive 
                              ? "bg-accent/15 border-accent/40 shadow-[inset_0_1px_rgba(255,255,255,0.15)]"
                              : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <h3 className={`font-semibold text-sm ${isActive ? "text-accent" : "text-white"}`}>
                              {cls.name}
                            </h3>
                            <p className="text-[10px] text-slate mt-1">{cls.code} · Taught by {cls.teacherName}</p>
                          </div>
                          <NeonBadge color="blue" size="sm">
                            Joined
                          </NeonBadge>
                        </div>
                      );
                    })}
                    {myClasses.length === 0 && (
                      <div className="py-6 text-center text-slate text-xs border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                        You haven't joined any classes yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Explore Available Classrooms */}
                <div>
                  <h2 className="text-xs font-bold text-slate uppercase tracking-wider mb-2.5">Explore Classes ({exploreClasses.length})</h2>
                  <div className="space-y-2.5">
                    {exploreClasses.map((cls) => {
                      const isActive = selectedClass && (selectedClass._id === cls._id || selectedClass.id === cls.id);
                      return (
                        <div 
                          key={cls._id || cls.id}
                          onClick={() => handleClassSelect(cls)}
                          className={`group relative flex items-center justify-between rounded-2xl p-4 border transition-all duration-300 cursor-pointer ${
                            isActive 
                              ? "bg-white/[0.08] border-white/[0.2]"
                              : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm text-slate group-hover:text-white transition-colors">
                              {cls.name}
                            </h3>
                            <p className="text-[10px] text-subtle group-hover:text-slate transition-colors mt-1">
                              {cls.code} · {cls.department}
                            </p>
                          </div>
                          <Lock className="h-3.5 w-3.5 text-subtle group-hover:text-slate transition-colors mr-1" />
                        </div>
                      );
                    })}
                    {exploreClasses.length === 0 && (
                      <div className="py-6 text-center text-slate text-xs border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                        No other available classes found.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Classroom Workspace */}
              <div className="md:col-span-2">
                {selectedClass ? (
                  isRegistered(selectedClass) ? (
                    /* Workspace for Registered Students */
                    <GlassCard className="relative overflow-visible" padding="md">
                      <div className="flex items-start justify-between mb-4 border-b border-white/[0.06] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-heading text-xl font-bold text-white">{selectedClass.name}</h2>
                            <NeonBadge color="mint" size="sm">Registered</NeonBadge>
                          </div>
                          <p className="text-xs text-slate mt-1">
                            {selectedClass.code} · Dept of {selectedClass.department} · Advised by <strong>{selectedClass.teacherName}</strong>
                          </p>
                        </div>
                      </div>

                      <Tabs
                        tabs={[
                          {
                            id: "materials",
                            label: "Lecture Materials",
                            icon: <FileText className="h-3.5 w-3.5" />,
                            content: (
                              <div className="space-y-4 pt-3">
                                {notesLoading ? (
                                  <div className="flex justify-center py-6">
                                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                                  </div>
                                ) : classNotes.map((note, idx) => (
                                  <GlassCard key={idx} variant="subtle" padding="sm" className="border-white/[0.04]">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-semibold text-xs text-white">{note.title}</h4>
                                        <p className="text-[10px] text-slate mt-0.5">
                                          By {note.senderName} · {new Date(note.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      {note.pdfData && (
                                        <a 
                                          href={note.pdfData} 
                                          download={note.pdfName || "lecture_notes.pdf"}
                                          className="flex items-center gap-1 text-[10px] text-mint hover:underline font-semibold"
                                        >
                                          <Download className="h-3 w-3" /> Download PDF
                                        </a>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate mt-2.5 whitespace-pre-wrap leading-relaxed">
                                      {note.content}
                                    </p>
                                  </GlassCard>
                                ))}
                                {classNotes.length === 0 && (
                                  <div className="py-8 text-center text-slate text-xs bg-white/[0.01] rounded-xl border border-white/5">
                                    No shared lecture notes found in this class.
                                  </div>
                                )}
                              </div>
                            )
                          },
                          {
                            id: "students",
                            label: `Classmates (${classStudents.length})`,
                            icon: <GraduationCap className="h-3.5 w-3.5" />,
                            content: (
                              <div className="space-y-3 pt-3">
                                {classStudents.map((student, idx) => (
                                  <div key={idx} className="flex items-center gap-3 rounded-xl bg-white/[0.01] p-3 border border-white/[0.04]">
                                    <Avatar name={student.fullName} size="sm" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-xs text-white">{student.fullName}</p>
                                      <p className="text-[10px] text-slate mt-0.5">{student.department} Department</p>
                                    </div>
                                    {student.uid === studentUid && (
                                      <NeonBadge color="cyan" size="sm">You</NeonBadge>
                                    )}
                                  </div>
                                ))}
                                {classStudents.length === 0 && (
                                  <div className="py-6 text-center text-slate text-xs bg-white/[0.01] rounded-xl border border-white/5">
                                    No students registered.
                                  </div>
                                )}
                              </div>
                            )
                          }
                        ]}
                      />
                    </GlassCard>
                  ) : (
                    /* Locked View for unregistered students */
                    <GlassCard className="flex flex-col items-center justify-center p-8 text-center" hover>
                      <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-[inset_0_1px_rgba(255,255,255,0.08)] mb-4">
                        <Lock className="h-6 w-6 text-rose" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-white">Classroom Locked</h3>
                      <p className="text-xs text-slate mt-1.5 max-w-sm leading-normal">
                        You are not registered in <strong>{selectedClass.name} ({selectedClass.code})</strong>. Join this open class to instantly unlock lecture materials, notes history, and connect with students.
                      </p>

                      <div className="mt-6 flex flex-col items-center gap-2 border-t border-white/[0.05] pt-6 w-full max-w-xs">
                        <div className="flex justify-between w-full text-xs text-slate mb-3 px-2">
                          <span>Department:</span>
                          <span className="text-white font-medium">{selectedClass.department}</span>
                        </div>
                        <div className="flex justify-between w-full text-xs text-slate mb-4 px-2">
                          <span>Teacher:</span>
                          <span className="text-white font-medium">{selectedClass.teacherName}</span>
                        </div>
                        <button
                          onClick={() => handleJoinClass(selectedClass)}
                          disabled={joinLoading}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-black hover:bg-accent/90 transition-colors disabled:opacity-55"
                        >
                          {joinLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                            </>
                          ) : (
                            "Join Classroom"
                          )}
                        </button>
                      </div>
                    </GlassCard>
                  )
                ) : (
                  <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.01] p-6 text-center text-slate">
                    <BookOpen className="h-10 w-10 text-slate/50 mb-3" />
                    <p className="text-sm font-semibold text-white">No Classroom Selected</p>
                    <p className="text-xs mt-1 max-w-xs leading-normal">
                      Select a classroom from the left listing panel to browse shared slides, notes, and study guides.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AppShell>
    </RoleGuard>
  );
}
