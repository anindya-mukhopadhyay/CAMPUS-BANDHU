"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Users, Calendar, FileText, Upload, Send, Plus, Loader2,
  GraduationCap, Download, CheckCircle
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

export default function FacultyPortalPage() {
  const { profile } = useAuthStore();
  const collegeName = profile?.collegeName || "Your Institution";

  // Data States
  const [clubs, setClubs] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [classNotes, setClassNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Dialog states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedClubForEvent, setSelectedClubForEvent] = useState<any | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Forms States - Create Class
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [classDept, setClassDept] = useState(profile?.department || "CSE");
  const [classLoading, setClassLoading] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);

  // Forms States - Post Club Event
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventCategory, setEventCategory] = useState("Hackathon");
  const [eventStartAt, setEventStartAt] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventImageBase64, setEventImageBase64] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  // Forms States - Share Note/PDF
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notePdfBase64, setNotePdfBase64] = useState("");
  const [notePdfName, setNotePdfName] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [emailDispatchLogs, setEmailDispatchLogs] = useState<any[] | null>(null);

  const fetchClubs = async () => {
    try {
      const res = await facultyService.getClubs();
      setClubs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch faculty clubs:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await facultyService.getClasses();
      setClasses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch faculty classes:", err);
    }
  };

  const loadFacultyData = async () => {
    setLoading(true);
    await Promise.all([fetchClubs(), fetchClasses()]);
    setLoading(false);
  };

  useEffect(() => {
    loadFacultyData();
  }, []);

  const handleClassSelect = async (cls: any) => {
    setSelectedClass(cls);
    setSelectedClassNotesLoading(true);
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
      setSelectedClassNotesLoading(false);
    }
  };

  const [selectedClassNotesLoading, setSelectedClassNotesLoading] = useState(false);

  // Image uploader helper for Events
  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image size exceeds 5MB limit", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEventImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // PDF file uploader helper for Class Notes
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setNoteError("Shared notes must be in PDF format.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNoteError("PDF size exceeds 10MB limit.");
      return;
    }

    setNotePdfName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setNotePdfBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit - Create Class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !classCode.trim()) {
      setClassError("Please enter class name and code.");
      return;
    }

    setClassLoading(true);
    setClassError(null);

    try {
      await facultyService.createClass({
        name: className.trim(),
        code: classCode.toUpperCase().trim(),
        department: classDept
      });

      toast({ title: "Classroom established successfully.", type: "success" });
      setClassName("");
      setClassCode("");
      setIsClassModalOpen(false);
      await fetchClasses();
    } catch (err: any) {
      setClassError(err?.message || "Failed to establish classroom.");
    } finally {
      setClassLoading(false);
    }
  };

  // Submit - Post Club Event
  const handlePostClubEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDesc.trim() || !eventVenue.trim()) {
      setEventError("Please enter event title, description, and venue.");
      return;
    }

    setEventLoading(true);
    setEventError(null);

    try {
      await facultyService.postClubEvent(selectedClubForEvent._id || selectedClubForEvent.id, {
        title: eventTitle.trim(),
        description: eventDesc.trim(),
        category: eventCategory,
        startAt: eventStartAt || undefined,
        venue: eventVenue.trim(),
        image: eventImageBase64 || undefined
      });

      toast({ title: "Club event scheduled and pre-approved.", type: "success" });
      setEventTitle("");
      setEventDesc("");
      setEventCategory("Hackathon");
      setEventStartAt("");
      setEventVenue("");
      setEventImageBase64("");
      setIsEventModalOpen(false);
      setSelectedClubForEvent(null);
    } catch (err: any) {
      setEventError(err?.message || "Failed to post club event.");
    } finally {
      setEventLoading(false);
    }
  };

  // Submit - Share Note / PDF
  const handleShareNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      setNoteError("Please enter note title and lecture description.");
      return;
    }

    setNoteLoading(true);
    setNoteError(null);
    setEmailDispatchLogs(null);

    try {
      const res = await facultyService.shareNote(selectedClass._id || selectedClass.id, {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        pdfData: notePdfBase64 || undefined,
        pdfName: notePdfName || undefined
      });

      toast({ title: "Notes shared and dispatched to students.", type: "success" });
      setNoteTitle("");
      setNoteContent("");
      setNotePdfBase64("");
      setNotePdfName("");
      
      // Load dispatch logs to showcase SMTP actions!
      if (res.data?.emailLogs) {
        setEmailDispatchLogs(res.data.emailLogs);
      }

      // Reload notes list
      const notesRes = await facultyService.getClassNotes(selectedClass._id || selectedClass.id);
      setClassNotes(notesRes.data || []);
    } catch (err: any) {
      setNoteError(err?.message || "Failed to share notes.");
    } finally {
      setNoteLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["faculty", "super_admin"]}>
      <AppShell>
        <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
          {/* Header */}
          <motion.div variants={stagger.item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-3xl font-bold text-white">Faculty Hub</h1>
                <NeonBadge color="cyan" size="md">Verified Advisor</NeonBadge>
              </div>
              <p className="mt-1 text-sm text-slate">
                Advise allocated student clubs, establish classrooms, and share lecture materials with {collegeName}.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsClassModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.08] transition-colors"
              >
                <BookOpen className="h-4 w-4 text-accent" /> Create Class
              </button>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <Tabs
              tabs={[
                {
                  id: "classroom",
                  label: "Open Classroom",
                  icon: <BookOpen className="h-4 w-4" />,
                  content: (
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Left: Class selection list */}
                      <div className="space-y-3 md:col-span-1">
                        <h2 className="text-sm font-semibold text-slate uppercase tracking-wider mb-2">My Open Classes</h2>
                        {classes.map((cls) => {
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
                                <p className="text-[11px] text-slate mt-1">{cls.code} · {cls.department}</p>
                              </div>
                              <NeonBadge color="blue" size="sm">
                                {cls.registeredStudentIds?.length || 0} students
                              </NeonBadge>
                            </div>
                          );
                        })}
                        {classes.length === 0 && (
                          <div className="py-8 text-center text-slate text-xs border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                            No classes established yet. Click "+ Create Class" to begin.
                          </div>
                        )}
                      </div>

                      {/* Right: Workspace of selected class */}
                      <div className="md:col-span-2">
                        {selectedClass ? (
                          <div className="space-y-6">
                            <GlassCard className="relative overflow-visible" padding="md">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h2 className="font-heading text-lg font-bold text-white">{selectedClass.name}</h2>
                                  <p className="text-xs text-slate mt-0.5">{selectedClass.code} · Dept of {selectedClass.department}</p>
                                </div>
                                <button
                                  onClick={() => setIsNoteModalOpen(true)}
                                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black hover:bg-accent/90 transition-colors"
                                >
                                  <Plus className="h-3.5 w-3.5" /> Share Note / PDF
                                </button>
                              </div>

                              <Tabs
                                tabs={[
                                  {
                                    id: "students",
                                    label: `Registered Roster (${classStudents.length})`,
                                    icon: <GraduationCap className="h-3.5 w-3.5" />,
                                    content: (
                                      <div className="space-y-3 pt-3">
                                        {classStudents.map((student, idx) => (
                                          <div key={idx} className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                                            <Avatar name={student.fullName} size="sm" />
                                            <div className="min-w-0 flex-1">
                                              <p className="font-semibold text-xs text-white">{student.fullName}</p>
                                              <p className="text-[10px] text-slate mt-0.5">{student.email} · Dept: {student.department}</p>
                                            </div>
                                          </div>
                                        ))}
                                        {classStudents.length === 0 && (
                                          <div className="py-6 text-center text-slate text-xs bg-white/[0.01] rounded-xl border border-white/5">No students registered in this class.</div>
                                        )}
                                      </div>
                                    )
                                  },
                                  {
                                    id: "materials",
                                    label: "Lecture Materials",
                                    icon: <FileText className="h-3.5 w-3.5" />,
                                    content: (
                                      <div className="space-y-4 pt-3">
                                        {selectedClassNotesLoading ? (
                                          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>
                                        ) : classNotes.map((note, idx) => (
                                          <GlassCard key={idx} variant="subtle" padding="sm" className="border-white/[0.04]">
                                            <div className="flex items-start justify-between">
                                              <div>
                                                <h4 className="font-semibold text-xs text-white">{note.title}</h4>
                                                <p className="text-[10px] text-slate mt-0.5">By {note.senderName} · {new Date(note.createdAt).toLocaleDateString()}</p>
                                              </div>
                                              {note.pdfData && (
                                                <a 
                                                  href={note.pdfData} 
                                                  download={note.pdfName || "notes.pdf"}
                                                  className="flex items-center gap-1 text-[10px] text-mint hover:underline font-semibold"
                                                >
                                                  <Download className="h-3 w-3" /> PDF Notes
                                                </a>
                                              )}
                                            </div>
                                            <p className="text-xs text-slate mt-2 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                          </GlassCard>
                                        ))}
                                        {classNotes.length === 0 && (
                                          <div className="py-6 text-center text-slate text-xs bg-white/[0.01] rounded-xl border border-white/5">No shared lecture notes found.</div>
                                        )}
                                      </div>
                                    )
                                  }
                                ]}
                              />
                            </GlassCard>
                          </div>
                        ) : (
                          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.01] p-6 text-center text-slate">
                            <BookOpen className="h-10 w-10 text-slate/50 mb-3" />
                            <p className="text-sm font-semibold text-white">No Classroom Selected</p>
                            <p className="text-xs mt-1 max-w-xs leading-normal">
                              Select an open class from the left menu panel or create a new one to manage rosters and share lecture slides.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  id: "clubs",
                  label: "Allocated Clubs",
                  icon: <Users className="h-4 w-4" />,
                  content: (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {clubs.map((club) => (
                          <GlassCard key={club._id || club.id} hover>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-base text-white">{club.name}</h3>
                                <p className="text-xs text-slate mt-0.5">{club.category} Club Advisor</p>
                              </div>
                              <NeonBadge color="cyan" size="sm">Active</NeonBadge>
                            </div>
                            <div className="mt-4 space-y-1 text-xs text-slate border-t border-white/[0.05] pt-3">
                              <p>Allocated Leader: <span className="text-white font-medium">{club.allocatedStudentName || "Unallocated"}</span></p>
                              <p>Advisory College: <span className="text-white font-medium">{club.collegeId}</span></p>
                              <p>Members Interested: <span className="text-white font-medium">{club.studentsInterested || 0}</span></p>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <button 
                                onClick={() => {
                                  setSelectedClubForEvent(club);
                                  setIsEventModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple to-accent px-4 py-2 text-xs font-semibold text-white shadow-glow-sm hover:shadow-neon"
                              >
                                <Calendar className="h-3.5 w-3.5" /> Post Club Event
                              </button>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                      {clubs.length === 0 && (
                        <div className="py-8 text-center text-slate text-xs border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                          You are not currently allocated as the advisor for any student clubs.
                        </div>
                      )}
                    </div>
                  )
                }
              ]}
            />
          )}
        </motion.div>

        {/* Modal: Create Class */}
        <AnimatePresence>
          {isClassModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <GlassCard className="max-w-md w-full relative shadow-glow animate-fade-in" padding="lg">
                <h3 className="font-heading text-xl font-bold flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-accent" /> Establish Classroom
                </h3>
                <p className="text-xs text-slate mb-6">
                  Create a new open class for academic advising. Matching department students will auto-register.
                </p>

                <form onSubmit={handleCreateClass} className="space-y-4">
                  {classError && (
                    <div className="rounded-xl bg-rose/15 p-3 text-xs text-rose border border-rose/10">
                      {classError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Class/Course Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Advanced Operating Systems"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      disabled={classLoading}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Course Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CSE-302"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      disabled={classLoading}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Advising Department</label>
                    <select
                      value={classDept}
                      onChange={(e) => setClassDept(e.target.value)}
                      disabled={classLoading}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:border-accent/30 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="ECE">Electronics (ECE)</option>
                      <option value="EE">Electrical (EE)</option>
                      <option value="ME">Mechanical (ME)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsClassModalOpen(false);
                        setClassName("");
                        setClassCode("");
                        setClassError(null);
                      }}
                      disabled={classLoading}
                      className="px-4 py-2 rounded-xl text-sm text-slate hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={classLoading}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent/90 transition-colors disabled:opacity-55"
                    >
                      {classLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        "Establish Class"
                      )}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Share Note / PDF */}
        <AnimatePresence>
          {isNoteModalOpen && selectedClass && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <GlassCard className="max-w-md w-full relative shadow-glow animate-fade-in my-8" padding="lg">
                <h3 className="font-heading text-xl font-bold flex items-center gap-2 mb-2">
                  <Send className="h-5 w-5 text-accent" /> Share Class Notes
                </h3>
                <p className="text-xs text-slate mb-6">
                  Distribute notes, slide decks, and lecture PDFs. Sharing automatically dispatches mock SMTP email notifications to all registered student mailboxes.
                </p>

                <form onSubmit={handleShareNote} className="space-y-4">
                  {noteError && (
                    <div className="rounded-xl bg-rose/15 p-3 text-xs text-rose border border-rose/10">
                      {noteError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Lecture Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lecture 4: Kernel Process Scheduling"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      disabled={noteLoading}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Rich Notes Content</label>
                    <textarea
                      rows={4}
                      placeholder="Share summaries, readups, formulas, or key reminders..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      disabled={noteLoading}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Upload PDF Document</label>
                    <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center hover:bg-white/[0.05] transition-colors cursor-pointer group">
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        disabled={noteLoading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="h-6 w-6 text-slate group-hover:text-accent transition-colors" />
                      <p className="mt-2 text-xs font-semibold text-white">
                        {notePdfName ? notePdfName : "Choose Note PDF"}
                      </p>
                      <p className="text-[10px] text-slate mt-0.5">Supports PDF notes up to 10MB</p>
                    </div>
                  </div>

                  {/* SMTP Dispatch logs */}
                  {emailDispatchLogs && (
                    <div className="rounded-xl border border-mint/20 bg-mint/5 p-3.5">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-mint">
                        <CheckCircle className="h-4 w-4" /> Mock SMTP Email Dispatch
                      </h4>
                      <p className="text-[10px] text-slate mt-1">Successfully connected to mail server. Dispatched to:</p>
                      <div className="max-h-24 overflow-y-auto mt-2 space-y-1 border-t border-mint/10 pt-2 text-[10px] font-mono text-slate">
                        {emailDispatchLogs.map((log, lIdx) => (
                          <div key={lIdx} className="flex justify-between">
                            <span>{log.email}</span>
                            <span className="text-mint font-semibold">SMTP: Delivered</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNoteModalOpen(false);
                        setNoteTitle("");
                        setNoteContent("");
                        setNotePdfBase64("");
                        setNotePdfName("");
                        setNoteError(null);
                        setEmailDispatchLogs(null);
                      }}
                      disabled={noteLoading}
                      className="px-4 py-2 rounded-xl text-sm text-slate hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                    >
                      Close Workspace
                    </button>
                    <button
                      type="submit"
                      disabled={noteLoading}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-black bg-accent hover:bg-accent/90 transition-colors disabled:opacity-55"
                    >
                      {noteLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sharing...
                        </>
                      ) : (
                        "Share Notes"
                      )}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Post Club Event */}
        <AnimatePresence>
          {isEventModalOpen && selectedClubForEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <GlassCard className="max-w-md w-full relative shadow-glow animate-fade-in my-8" padding="lg">
                <h3 className="font-heading text-xl font-bold flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple" /> Schedule Club Event
                </h3>
                <p className="text-xs text-slate mb-6">
                  Post a new event representing <strong>{selectedClubForEvent.name}</strong>. Event will be active and visible on the main campus calendar immediately.
                </p>

                <form onSubmit={handlePostClubEvent} className="space-y-4">
                  {eventError && (
                    <div className="rounded-xl bg-rose/15 p-3 text-xs text-rose border border-rose/10">
                      {eventError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Event Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Solidity Blockchain Bootcamp"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      disabled={eventLoading}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Specify event details, target audience, and agenda..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      disabled={eventLoading}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate">Category</label>
                      <select
                        value={eventCategory}
                        onChange={(e) => setEventCategory(e.target.value)}
                        disabled={eventLoading}
                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:border-accent/30 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="Hackathon">Hackathon</option>
                        <option value="Talk">Technical Talk</option>
                        <option value="Workshop">Hands-on Workshop</option>
                        <option value="Cultural">Cultural Festival</option>
                        <option value="Gaming">Gaming Arena</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        value={eventStartAt}
                        onChange={(e) => setEventStartAt(e.target.value)}
                        disabled={eventLoading}
                        className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:border-accent/30 focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Venue / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Seminar Hall 3, Block VI"
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      disabled={eventLoading}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate">Banner Image (Optional)</label>
                    <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center hover:bg-white/[0.05] transition-colors cursor-pointer group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleEventImageUpload}
                        disabled={eventLoading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {eventImageBase64 ? (
                        <img src={eventImageBase64} alt="Preview" className="max-h-24 rounded-lg shadow-md border border-white/10" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-slate group-hover:text-purple transition-colors" />
                          <p className="mt-1 text-xs font-semibold text-white">Choose Event Flyer</p>
                          <p className="text-[10px] text-slate">Under 5MB limit</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEventModalOpen(false);
                        setEventTitle("");
                        setEventDesc("");
                        setEventCategory("Hackathon");
                        setEventStartAt("");
                        setEventVenue("");
                        setEventImageBase64("");
                        setEventError(null);
                        setSelectedClubForEvent(null);
                      }}
                      disabled={eventLoading}
                      className="px-4 py-2 rounded-xl text-sm text-slate hover:text-white bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={eventLoading}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple to-accent hover:opacity-90 transition-colors disabled:opacity-55"
                    >
                      {eventLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scheduling...
                        </>
                      ) : (
                        "Post Event"
                      )}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </div>
          )}
        </AnimatePresence>
      </AppShell>
    </RoleGuard>
  );
}
