"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Mail, Calendar, BookOpen, Award, Briefcase, Trophy, Cpu,
  Edit3, Github, Linkedin, ExternalLink, Camera, Upload, X, Plus, Trash2, Code2, Folder, Sparkles
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { NeonBadge } from "@/components/ui/neon-badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useAuthStore, ROLE_LABELS, ROLE_COLORS } from "@/lib/stores/useAuthStore";
import { cn } from "@/lib/utils/cn";

const achievements = [
  { title: "Hackathon Hero", description: "Won 3 hackathons", icon: "🏆", rarity: "Legendary" },
  { title: "Event Explorer", description: "Attended 20+ events", icon: "🎯", rarity: "Epic" },
  { title: "Social Butterfly", description: "100+ connections", icon: "🦋", rarity: "Rare" },
  { title: "Code Warrior", description: "500+ commits", icon: "⚔️", rarity: "Epic" },
  { title: "First Steps", description: "Created profile", icon: "👣", rarity: "Common" },
  { title: "Team Player", description: "Joined 5 teams", icon: "🤝", rarity: "Rare" },
];

const rarityColors: Record<string, string> = {
  Legendary: "blaze",
  Epic: "purple",
  Rare: "cyan",
  Common: "blue",
};

const PREDEFINED_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "Solidity", "SQL",
  "React", "Node.js", "Next.js", "Express", "TensorFlow", "PyTorch", "Docker", "Kubernetes", "Ethereum",
  "UI/UX Design", "Data Structures", "Algorithms", "Web3", "Machine Learning"
];

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

// Reusable macOS Terminal Console Wrapper
const ConsoleWindow = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("rounded-3xl border border-white/[0.08] bg-[#070b15]/75 backdrop-blur-md shadow-2xl overflow-hidden text-left flex flex-col transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]", className)}>
      {/* Console Title Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.02] border-b border-white/[0.06] select-none shrink-0">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose border border-rose/30 shadow-inner" />
          <span className="w-2.5 h-2.5 rounded-full bg-blaze border border-blaze/30 shadow-inner" />
          <span className="w-2.5 h-2.5 rounded-full bg-mint border border-mint/30 shadow-inner" />
        </div>
        <span className="text-[9px] font-mono font-extrabold text-slate/40 uppercase tracking-[0.2em]">{title}</span>
        <div className="w-9 h-1 bg-transparent" />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { profile, role, user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [coverMenuOpen, setCoverMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  // Terminal Console State
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "CAMPUS-BANDHU profile shell console [v2.0].",
    "Type 'help' to see list of available command commands or run macros below.",
    ""
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Repositioning banner cover photo
  const [isRepositioningCover, setIsRepositioningCover] = useState(false);
  const [coverDragX, setCoverDragX] = useState(0);
  const [coverDragY, setCoverDragY] = useState(0);
  const [coverDragZoom, setCoverDragZoom] = useState(1);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const [touchStartZoom, setTouchStartZoom] = useState(1);

  // Projects Modal
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    photoUrl: "",
    youtubeLink: "",
    githubLink: ""
  });

  // Experience Modal
  const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);
  const [newExperience, setNewExperience] = useState({
    role: "",
    company: "",
    duration: "",
    description: ""
  });

  // License Modal
  const [isAddLicenseOpen, setIsAddLicenseOpen] = useState(false);
  const [newLicense, setNewLicense] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: ""
  });

  // Sync repositioning
  useEffect(() => {
    if (profile?.coverX !== undefined) setCoverDragX(profile.coverX);
    if (profile?.coverY !== undefined) {
      setCoverDragY(profile.coverY);
    } else {
      setCoverDragY(0);
    }
    if (profile?.coverZoom !== undefined) setCoverDragZoom(profile.coverZoom);
  }, [profile?.coverX, profile?.coverY, profile?.coverZoom]);

  const handleCoverMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioningCover) return;
    setIsDraggingCover(true);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    e.preventDefault();
  };

  const handleCoverMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCover || !isRepositioningCover) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    if (e.shiftKey) {
      const zoomSensitivity = 0.005;
      setCoverDragZoom((prev) => {
        const nextZoom = prev - deltaY * zoomSensitivity;
        return Math.max(1, Math.min(4, nextZoom));
      });
    } else {
      setCoverDragX((prev) => prev + deltaX);
      setCoverDragY((prev) => prev + deltaY);
    }
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
  };

  const handleCoverMouseUp = () => {
    setIsDraggingCover(false);
  };

  const handleCoverTouchStart = (e: React.TouchEvent) => {
    if (!isRepositioningCover) return;
    if (e.touches && e.touches.length === 1 && e.touches[0]) {
      setIsDraggingCover(true);
      setDragStartX(e.touches[0].clientX);
      setDragStartY(e.touches[0].clientY);
      setTouchStartDist(null);
    } else if (e.touches && e.touches.length === 2 && e.touches[0] && e.touches[1]) {
      setIsDraggingCover(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDist(dist);
      setTouchStartZoom(coverDragZoom);
    }
  };

  const handleCoverTouchMove = (e: React.TouchEvent) => {
    if (!isRepositioningCover) return;
    if (e.touches && e.touches.length === 1 && isDraggingCover && e.touches[0]) {
      const deltaX = e.touches[0].clientX - dragStartX;
      const deltaY = e.touches[0].clientY - dragStartY;
      setCoverDragX((prev) => prev + deltaX);
      setCoverDragY((prev) => prev + deltaY);
      setDragStartX(e.touches[0].clientX);
      setDragStartY(e.touches[0].clientY);
    } else if (e.touches && e.touches.length === 2 && touchStartDist !== null && e.touches[0] && e.touches[1]) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDist;
      const nextZoom = touchStartZoom * scale;
      setCoverDragZoom(Math.max(1, Math.min(4, nextZoom)));
    }
  };

  const handleCoverWheel = (e: React.WheelEvent) => {
    if (!isRepositioningCover) return;
    if (e.shiftKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      setCoverDragZoom((prev) => {
        const nextZoom = prev - e.deltaY * zoomSensitivity;
        return Math.max(1, Math.min(4, nextZoom));
      });
    }
  };

  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    department: "",
    graduationYear: 2025,
    bio: "",
    githubUrl: "",
    linkedinUrl: "",
    leetcodeUrl: "",
    orcidUrl: "",
    resumeUrl: "",
    skills: [] as string[],
    interests: "",
    collegeName: "",
    avatarUrl: "",
    coverPhotoUrl: "",
    avatarZoom: 1,
    avatarX: 0,
    avatarY: 0,
    coverZoom: 1,
    coverX: 0,
    coverY: 0,
    gender: "Undeclared"
  });

  const handleSave = async () => {
    if (editData.skills.length < 1) {
      alert("Please select at least 1 skill!");
      return;
    }
    if (editData.skills.length > 5) {
      alert("Please select at most 5 skills!");
      return;
    }
    setIsEditing(false);
    await updateProfile({
      fullName: editData.fullName,
      email: editData.email,
      department: editData.department,
      graduationYear: Number(editData.graduationYear) || 2025,
      bio: editData.bio,
      githubUrl: editData.githubUrl,
      linkedinUrl: editData.linkedinUrl,
      leetcodeUrl: editData.leetcodeUrl,
      orcidUrl: editData.orcidUrl,
      resumeUrl: editData.resumeUrl,
      collegeName: editData.collegeName,
      avatarUrl: editData.avatarUrl,
      coverPhotoUrl: editData.coverPhotoUrl,
      avatarZoom: editData.avatarZoom,
      avatarX: editData.avatarX,
      avatarY: editData.avatarY,
      coverZoom: editData.coverZoom,
      coverX: editData.coverX,
      coverY: editData.coverY,
      gender: editData.gender,
      skills: editData.skills,
      interests: editData.interests.split(",").map(i => i.trim()).filter(Boolean)
    });
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) {
      alert("Title and Description are required!");
      return;
    }
    const currentProjects = profile?.projects || [];
    await updateProfile({ projects: [...currentProjects, newProject] });
    setIsAddProjectOpen(false);
    setNewProject({ title: "", description: "", photoUrl: "", youtubeLink: "", githubLink: "" });
  };

  const handleDeleteProject = async (index: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const currentProjects = profile?.projects || [];
      const updated = currentProjects.filter((_, i) => i !== index);
      await updateProfile({ projects: updated });
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExperience.role || !newExperience.company || !newExperience.duration) {
      alert("Role, Company, and Duration are required!");
      return;
    }
    const currentExp = profile?.experience || [];
    await updateProfile({ experience: [...currentExp, newExperience] });
    setIsAddExperienceOpen(false);
    setNewExperience({ role: "", company: "", duration: "", description: "" });
  };

  const handleDeleteExperience = async (index: number) => {
    if (confirm("Are you sure you want to delete this experience?")) {
      const currentExp = profile?.experience || [];
      const updated = currentExp.filter((_, i) => i !== index);
      await updateProfile({ experience: updated });
    }
  };

  const handleAddLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicense.name || !newLicense.issuer) {
      alert("Credential Name and Issuing Authority are required!");
      return;
    }
    const currentLicenses = profile?.licenses || [];
    await updateProfile({ licenses: [...currentLicenses, newLicense] });
    setIsAddLicenseOpen(false);
    setNewLicense({ name: "", issuer: "", issueDate: "", credentialUrl: "" });
  };

  const handleDeleteLicense = async (index: number) => {
    if (confirm("Are you sure you want to delete this credential?")) {
      const currentLicenses = profile?.licenses || [];
      const updated = currentLicenses.filter((_, i) => i !== index);
      await updateProfile({ licenses: updated });
    }
  };

  const getGitHubUsername = (url?: string) => {
    if (!url) return null;
    const cleaned = url.replace(/\/$/, "");
    const parts = cleaned.split("/");
    return parts[parts.length - 1];
  };
  const githubUsername = getGitHubUsername(profile?.githubUrl);

  const [repositories, setRepositories] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalCommits, setTotalCommits] = useState(0);

  useEffect(() => {
    if (!githubUsername) {
      setRepositories([]);
      return;
    }

    const fetchRepos = async () => {
      setLoadingRepos(true);
      try {
        const res = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            let maxStars = -1;
            let maxStarsIdx = -1;
            let maxForks = -1;
            let maxForksIdx = -1;
            let newestTime = 0;
            let newestIdx = -1;

            const processed = data.map((repo: any, idx: number) => {
              const createdTime = new Date(repo.created_at).getTime();
              
              if ((repo.stargazers_count || 0) > maxStars) {
                maxStars = repo.stargazers_count || 0;
                maxStarsIdx = idx;
              }
              if ((repo.forks_count || 0) > maxForks) {
                maxForks = repo.forks_count || 0;
                maxForksIdx = idx;
              }
              if (createdTime > newestTime) {
                newestTime = createdTime;
                newestIdx = idx;
              }

              return {
                name: repo.name,
                description: repo.description || "No description provided for this repository.",
                language: repo.language || "TypeScript",
                forks: repo.forks_count || 0,
                stars: repo.stargazers_count || 0,
                tag: "",
                created_at: repo.created_at,
                html_url: repo.html_url || `https://github.com/${githubUsername}/${repo.name}`
              };
            });

            const maxStarRepo = maxStarsIdx !== -1 && maxStars > 0 ? processed[maxStarsIdx] : null;
            if (maxStarRepo) {
              maxStarRepo.tag = "Most Star";
            }
            const maxForkRepo = maxForksIdx !== -1 && maxForksIdx !== maxStarsIdx && maxForks > 0 ? processed[maxForksIdx] : null;
            if (maxForkRepo) {
              maxForkRepo.tag = "Highest Fork";
            }
            const newestRepo = newestIdx !== -1 && newestIdx !== maxStarsIdx && newestIdx !== maxForksIdx ? processed[newestIdx] : null;
            if (newestRepo) {
              newestRepo.tag = "New";
            }

            setRepositories(processed);
          }
        }

        const contribRes = await fetch(`https://github-contributions-api.deno.dev/${githubUsername}.json`);
        if (contribRes.ok) {
          const contribData = await contribRes.json();
          setTotalCommits(contribData.totalContributions || 0);

          let streak = 0;
          if (contribData.contributions) {
            const allDays = contribData.contributions.flat().reverse();
            if (allDays.length > 0) {
              let startIndex = 0;
              if (allDays[0].contributionCount === 0) {
                if (allDays.length > 1 && allDays[1].contributionCount > 0) {
                  startIndex = 1;
                } else {
                  startIndex = -1;
                }
              }
              
              if (startIndex !== -1) {
                for (let i = startIndex; i < allDays.length; i++) {
                  if (allDays[i].contributionCount > 0) {
                    streak++;
                  } else {
                    break;
                  }
                }
              }
            }
          }
          setCurrentStreak(streak);
        }
      } catch (err) {
        console.error("Error fetching GitHub repos:", err);
      } finally {
        setLoadingRepos(false);
      }
    };

    fetchRepos();
  }, [githubUsername]);

  const getSkillCategory = (skill: string) => {
    const langs = ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "Solidity", "SQL"];
    const frameworks = ["React", "Node.js", "Next.js", "Express", "TensorFlow", "PyTorch"];
    const devops = ["Docker", "Kubernetes", "Ethereum", "Web3"];
    
    if (langs.includes(skill)) return "Languages";
    if (frameworks.includes(skill)) return "Frameworks & Tools";
    if (devops.includes(skill)) return "DevOps & Web3";
    return "Core Domains";
  };

  const userSkills = profile?.skills || [];
  const groupedSkills: Record<string, string[]> = {
    "Languages": [],
    "Frameworks & Tools": [],
    "DevOps & Web3": [],
    "Core Domains": []
  };

  userSkills.forEach(skill => {
    const category = getSkillCategory(skill);
    if (!groupedSkills[category]) {
      groupedSkills[category] = [];
    }
    groupedSkills[category].push(skill);
  });

  // Terminal Execution Engine
  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (trimmed === "") return;
    const lowerCmd = trimmed.toLowerCase();
    const historyUpdate = [...terminalHistory, `guest@campus-bandhu:~$ ${trimmed}`];

    if (lowerCmd === "help") {
      historyUpdate.push(
        "Available shell scripts:",
        "  bio         - Print system summary developer bio",
        "  stats       - Query database stats (connections, quests, XP)",
        "  skills      - List categorized developer stack config",
        "  projects    - Query active folder directory projects",
        "  experience  - Print employment journey timeline log",
        "  clear       - Clear terminal console prompt screen"
      );
    } else if (lowerCmd === "bio") {
      historyUpdate.push(
        `[sys.bio]: "${profile?.bio || "Passionate software engineer building modern decentralized web applications."}"`
      );
    } else if (lowerCmd === "stats") {
      historyUpdate.push(
        "═ PROFILE STATS DB ══════════════════════════",
        `  Full Name:   ${profile?.fullName || "User"}`,
        `  Affiliation: ${profile?.collegeName || "NSUT, New Delhi"}`,
        `  Connection:  ${profile?.stats?.connections || 0} node synergy links`,
        `  Quest Logs:  ${profile?.stats?.eventsJoined || 0} registered events`,
        `  Power Level: ${profile?.stats?.xpPoints || 0} XP (Coder Lvl ${Math.floor((profile?.stats?.xpPoints || 0) / 100) + 1})`
      );
    } else if (lowerCmd === "skills") {
      historyUpdate.push(
        "═ TECH CONFIG ══════════════════════════════",
        `  Languages:   ${(groupedSkills["Languages"] || []).join(", ") || "Undeclared"}`,
        `  Frameworks:  ${(groupedSkills["Frameworks & Tools"] || []).join(", ") || "Undeclared"}`,
        `  DevOps/Web3: ${(groupedSkills["DevOps & Web3"] || []).join(", ") || "Undeclared"}`,
        `  Domains:     ${(groupedSkills["Core Domains"] || []).join(", ") || "Undeclared"}`
      );
    } else if (lowerCmd === "projects") {
      if (profile?.projects && profile.projects.length > 0) {
        historyUpdate.push("═ PROJECT DIRECTORY ═════════════════════════");
        profile.projects.forEach((proj, idx) => {
          historyUpdate.push(
            `  [${idx + 1}] ${proj.title}`,
            `      Description: ${proj.description}`,
            proj.githubLink ? `      Repository:  ${proj.githubLink}` : ""
          );
        });
      } else {
        historyUpdate.push("No projects detected in local workspace directory.");
      }
    } else if (lowerCmd === "experience") {
      if (profile?.experience && profile.experience.length > 0) {
        historyUpdate.push("═ JOURNEY TIMELINE ══════════════════════════");
        profile.experience.forEach((exp) => {
          historyUpdate.push(
            `  • ${exp.role} @ ${exp.company} (${exp.duration})`,
            exp.description ? `    Description: ${exp.description}` : ""
          );
        });
      } else {
        historyUpdate.push("No timeline history items stored in database.");
      }
    } else if (lowerCmd === "clear") {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else {
      historyUpdate.push(`Command unrecognized: '${trimmed}'. Type 'help' for core commands.`);
    }

    setTerminalHistory(historyUpdate);
    setTerminalInput("");
  };

  // Scroll to bottom of terminal whenever history updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  const levelProgress = ((profile?.stats?.xpPoints || 0) % 100);
  const currentLvl = Math.floor((profile?.stats?.xpPoints || 0) / 100) + 1;

  return (
    <AppShell>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        
        {/* Futuristic Cyber Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Bento Box 1: Large Hero Block (Col-span 2, Row-span 2 on desktop) */}
          <div className="md:col-span-2 lg:col-span-2 flex flex-col">
            <ConsoleWindow title="[shell] - profile.sh" className="h-full flex flex-col justify-between">
              
              {/* Cover Banner Reposition container */}
              <div 
                className={`relative h-40 w-full rounded-2xl overflow-hidden group/cover border border-white/5 shrink-0 ${
                  isRepositioningCover ? "cursor-move touch-none select-none z-10" : "cursor-pointer"
                }`}
                onClick={() => { if (!isRepositioningCover) setCoverMenuOpen(true); }}
                onMouseDown={handleCoverMouseDown}
                onMouseMove={handleCoverMouseMove}
                onMouseUp={handleCoverMouseUp}
                onMouseLeave={handleCoverMouseUp}
                onWheel={handleCoverWheel}
                onTouchStart={handleCoverTouchStart}
                onTouchMove={handleCoverTouchMove}
                onTouchEnd={handleCoverMouseUp}
              >
                {profile?.coverPhotoUrl ? (
                  <img
                    src={profile.coverPhotoUrl}
                    alt="Cover Banner"
                    className={`h-full w-full object-cover opacity-85 pointer-events-none select-none origin-center ${
                      isRepositioningCover ? "" : "transition-all duration-700 group-hover/cover:scale-105"
                    }`}
                    style={{
                      transform: isRepositioningCover
                        ? `translate(${coverDragX}px, ${coverDragY}px) scale(${coverDragZoom})`
                        : `translate(${profile?.coverX || 0}px, ${profile?.coverZoom !== undefined ? (profile?.coverY || 0) : 0}px) scale(${profile?.coverZoom || 1})`
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-accent/20 via-purple/20 to-electric/20 transition-all duration-700 group-hover/cover:brightness-115 pointer-events-none select-none" />
                )}

                {isRepositioningCover ? (
                  <div className="absolute inset-0 bg-black/45 flex flex-col justify-between p-3 select-none pointer-events-none z-20">
                    <div className="mx-auto rounded-xl bg-black/85 px-4 py-1 text-[10px] font-semibold text-white backdrop-blur-md flex items-center gap-1.5 shadow-lg border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-mint animate-ping" />
                      Drag to reposition • Shift+Drag/Scroll or Pinch to Zoom
                    </div>
                    <div className="flex justify-end gap-2 pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsRepositioningCover(false);
                          setCoverDragX(profile?.coverX || 0);
                          setCoverDragY(profile?.coverZoom !== undefined ? (profile?.coverY || 0) : 0);
                          setCoverDragZoom(profile?.coverZoom || 1);
                        }}
                        className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[9px] font-bold text-white transition-colors cursor-pointer border border-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setIsRepositioningCover(false);
                          await updateProfile({ 
                            coverX: coverDragX,
                            coverY: coverDragY,
                            coverZoom: coverDragZoom
                          });
                        }}
                        className="rounded-lg bg-mint px-2.5 py-1 text-[9px] font-bold text-base transition-colors cursor-pointer shadow-md"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 bg-black/60 hover:bg-black/85 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 border border-white/10">
                    <Camera className="h-3.5 w-3.5 text-white" />
                    <span className="text-[10px] font-semibold text-white">Cover Options</span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 grid-background opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b15]/95 via-transparent to-transparent" />
              </div>

              {/* Avatar profile info */}
              <div className="relative flex items-end gap-5 -mt-10 px-4 mb-4 shrink-0">
                <div className="relative group cursor-pointer shrink-0 z-10" onClick={() => setAvatarMenuOpen(true)}>
                  <div className="relative rounded-full p-1 bg-gradient-to-tr from-accent via-purple to-mint shadow-glow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow-md">
                    <Avatar
                      src={profile?.avatarUrl || user?.photoURL}
                      name={profile?.fullName || "User"}
                      size="xl"
                      status="online"
                      className="ring-4 ring-panel"
                      imageStyle={{
                        transform: `scale(${profile?.avatarZoom || 1}) translate(${profile?.avatarX || 0}px, ${profile?.avatarY || 0}px)`
                      }}
                    />
                    <div className="absolute inset-1 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="h-5 w-5 text-white animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="min-w-0 pb-1 space-y-1">
                  <h1 className="font-heading text-2xl font-black text-white tracking-tight flex items-center gap-2 leading-none">
                    {profile?.fullName || "User"}
                    <span className="text-mint text-sm animate-pulse" title="System Verified Coder">✓</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <NeonBadge color={(ROLE_COLORS[role!] || "blue") as any} size="sm">
                      {ROLE_LABELS[role!] || "Student"}
                    </NeonBadge>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-mint/20 bg-mint/5 px-2.5 py-0.5 text-[9px] font-semibold font-mono text-mint shadow-glow-xs">
                      <span>@</span>
                      <span>{profile?.fullName?.toLowerCase().replace(/\s+/g, "") || "user"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata details grids */}
              <div className="grid grid-cols-2 gap-4 border-y border-white/[0.06] py-3.5 my-3 text-left shrink-0">
                <div className="flex items-center gap-3 text-slate hover:text-white transition-colors duration-200">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                    <MapPin className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-xs font-bold truncate">{profile?.collegeName || "NSUT, New Delhi"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate hover:text-white transition-colors duration-200">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint/10 border border-mint/20">
                    <Mail className="h-4 w-4 text-mint" />
                  </div>
                  <span className="text-xs font-bold truncate">{profile?.email || user?.email || "youanindya1@gmail.com"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate hover:text-white transition-colors duration-200">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple/10 border border-purple/20">
                    <Calendar className="h-4 w-4 text-purple" />
                  </div>
                  <span className="text-xs font-bold">Class of {profile?.graduationYear || 2025}</span>
                </div>
                <div className="flex items-center gap-3 text-slate hover:text-white transition-colors duration-200">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan/10 border border-cyan/20">
                    <BookOpen className="h-4 w-4 text-cyan" />
                  </div>
                  <span className="text-xs font-bold truncate">{profile?.department || "Computer Science"}</span>
                </div>
              </div>

              {/* Connected Social Accounts Grid */}
              <div className="w-full grid grid-cols-2 gap-2.5 my-2 shrink-0 text-left">
                <a
                  href={profile?.githubUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all duration-300",
                    profile?.githubUrl
                      ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-white"
                      : "border-dashed border-white/5 bg-transparent text-slate/30 pointer-events-none opacity-45"
                  )}
                >
                  <Github className="h-4 w-4 shrink-0 text-purple" />
                  <span className="truncate">GitHub</span>
                </a>
                <a
                  href={profile?.linkedinUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all duration-300",
                    profile?.linkedinUrl
                      ? "border-[#0077b5]/30 bg-[#0077b5]/5 hover:bg-[#0077b5]/15 hover:border-[#0077b5]/50 text-[#0077b5]"
                      : "border-dashed border-white/5 bg-transparent text-slate/30 pointer-events-none opacity-45"
                  )}
                >
                  <Linkedin className="h-4 w-4 shrink-0" />
                  <span className="truncate">LinkedIn</span>
                </a>
              </div>

              {/* Action operations and Resume */}
              <div className="flex gap-3 w-full shrink-0">
                {profile?.resumeUrl && (
                  <a 
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-electric py-2.5 text-xs font-bold text-white shadow-neon transition-all hover:shadow-glow-xs cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" /> Download Resume / CV
                  </a>
                )}
                <button 
                  onClick={() => {
                    setEditData({
                      fullName: profile?.fullName || "",
                      email: profile?.email || user?.email || "youanindya1@gmail.com",
                      department: profile?.department || "",
                      graduationYear: profile?.graduationYear || 2025,
                      bio: profile?.bio || "Passionate about AI and building decentralized systems.",
                      githubUrl: profile?.githubUrl || "",
                      linkedinUrl: profile?.linkedinUrl || "",
                      leetcodeUrl: profile?.leetcodeUrl || "",
                      orcidUrl: profile?.orcidUrl || "",
                      resumeUrl: profile?.resumeUrl || "",
                      skills: profile?.skills || [],
                      interests: profile?.interests?.join(", ") || "",
                      collegeName: profile?.collegeName || "NSUT, New Delhi",
                      avatarUrl: profile?.avatarUrl || "",
                      coverPhotoUrl: profile?.coverPhotoUrl || "",
                      avatarZoom: profile?.avatarZoom || 1,
                      avatarX: profile?.avatarX || 0,
                      avatarY: profile?.avatarY || 0,
                      coverZoom: profile?.coverZoom || 1,
                      coverX: profile?.coverX || 0,
                      coverY: profile?.coverZoom !== undefined ? (profile?.coverY || 0) : 0,
                      gender: profile?.gender || "Undeclared"
                    });
                    setIsEditing(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" /> Config Settings
                </button>
              </div>
            </ConsoleWindow>
          </div>

          {/* Bento Box 1.5: Interactive Terminal Prompt (Col-span 1) */}
          <div className="md:col-span-1 lg:col-span-1 flex flex-col">
            <ConsoleWindow title="[shell] - terminal.sh" className="h-full flex flex-col justify-between font-mono bg-black/85">
              
              {/* Terminal History Logs */}
              <div className="flex-1 overflow-y-auto text-[10px] text-mint leading-relaxed max-h-[280px] pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
                {terminalHistory.map((line, idx) => (
                  <p key={idx} className={cn(
                    line.startsWith("guest@") && "text-accent font-bold",
                    line.startsWith("═") && "text-slate/40",
                    !line.startsWith("guest@") && !line.startsWith("═") && "text-mint/95"
                  )}>
                    {line}
                  </p>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Terminal Input Line */}
              <div className="border-t border-white/5 pt-3 mt-3">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeCommand(terminalInput);
                  }}
                  className="flex items-center gap-1.5 text-[10px] text-accent font-bold"
                >
                  <span className="shrink-0">guest@campus-bandhu:~$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="run command..."
                    className="flex-1 bg-transparent text-mint outline-none border-none p-0 text-[10px] font-mono focus:ring-0 placeholder:text-slate/30"
                  />
                </form>
              </div>

              {/* Clickable Macros */}
              <div className="mt-3.5 pt-3 border-t border-white/5 text-left">
                <p className="text-[9px] text-slate/50 font-bold mb-2 uppercase tracking-wider">// CLI Macro Shortcuts</p>
                <div className="flex flex-wrap gap-1.5">
                  {["bio", "stats", "skills", "projects", "experience"].map((macro) => (
                    <button
                      key={macro}
                      onClick={() => executeCommand(macro)}
                      className="rounded-lg bg-white/[0.04] border border-white/10 px-2 py-1 text-[9px] font-bold text-slate hover:text-mint hover:border-mint/30 transition-all cursor-pointer select-none"
                    >
                      {macro}()
                    </button>
                  ))}
                </div>
              </div>
            </ConsoleWindow>
          </div>

          {/* Bento Box 2: Gamified RPG HUD Player Stats (Col-span 1) */}
          <div className="md:col-span-1 lg:col-span-1 flex flex-col">
            <ConsoleWindow title="[system] - profile.cfg" className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading text-base font-bold flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-blaze" /> Player Status
                  </h3>
                  <span className="text-[9px] font-mono text-mint font-extrabold uppercase bg-mint/5 border border-mint/20 px-2 py-0.5 rounded shadow-glow-xs animate-pulse">ACTIVE_SYSTEM</span>
                </div>

                {/* Monospace level indicators */}
                <div className="p-4 rounded-2xl bg-[#090e1a]/80 border border-white/[0.04] space-y-3 shadow-inner">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-mono text-slate/40 uppercase tracking-widest font-bold">SYSTEM LEVEL</p>
                      <p className="font-heading text-lg font-black text-white">Level {currentLvl} Coder</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blaze">{profile?.stats?.xpPoints || 0} TOTAL XP</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-mono font-bold text-slate/60">
                      <span>NEXT LEVEL EXP</span>
                      <span>{levelProgress} / 100</span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02] relative">
                      <div className="h-full rounded-full bg-gradient-to-r from-blaze to-accent shadow-glow-xs transition-all duration-500" style={{ width: `${levelProgress}%` }} />
                    </div>
                  </div>
                </div>

                {/* System attributes stats list */}
                <div className="space-y-3 pt-2 text-[11px] font-mono">
                  <p className="text-[9px] text-slate/40 uppercase tracking-widest font-bold font-mono">// RPG Attributes</p>
                  {[
                    { name: "Node Synergy", value: profile?.stats?.connections || 0, desc: "Total connection points", color: "text-mint" },
                    { name: "Quests Log", value: profile?.stats?.eventsJoined || 0, desc: "Events attended completed", color: "text-cyan" },
                    { name: "Artifacts Unlocked", value: profile?.stats?.achievements || 0, desc: "Collectibles & achievements", color: "text-purple" },
                    { name: "Terminal Power", value: profile?.stats?.xpPoints || 0, desc: "Active system experience score", color: "text-blaze" },
                  ].map((attr) => (
                    <div key={attr.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/10 transition-colors duration-200">
                      <div>
                        <p className="font-bold text-white">{attr.name}</p>
                        <p className="text-[9px] text-slate font-semibold">{attr.desc}</p>
                      </div>
                      <span className={cn("text-sm font-black", attr.color)}>{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ConsoleWindow>
          </div>

          {/* Bento Box 3: GitHub Contributions (Full-Width, Col-span 3) */}
          {githubUsername && (
            <div className="md:col-span-2 lg:col-span-3 flex flex-col">
              <ConsoleWindow title="[github] - contributions.log" className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="mb-1 font-heading text-base font-bold flex items-center gap-2 text-white">
                    <Github className="h-5 w-5 text-purple animate-spin-slow" /> GitHub Activity Tracker
                  </h3>
                  <p className="text-xs text-slate mb-4 font-semibold">Repository synchronization commits calendar log.</p>
                  
                  <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="w-full md:w-auto min-w-0 flex-1 overflow-x-auto scrollbar-none">
                      <img 
                        src={`https://ghchart.rshah.org/8b5cf6/${githubUsername}`} 
                        alt="GitHub Contribution Calendar" 
                        className="h-28 object-contain filter hover:brightness-110 transition-all duration-300 mx-auto"
                      />
                    </div>

                    <div className="flex gap-4 self-stretch md:self-auto justify-around shrink-0 md:pl-5 md:border-l border-white/[0.06]">
                      <div className="text-center px-4 font-mono">
                        <p className="font-heading text-2xl font-black text-mint">{currentStreak}</p>
                        <p className="text-[9px] text-slate font-bold uppercase tracking-widest mt-0.5">Commit Streak</p>
                      </div>
                      <div className="text-center px-4 font-mono">
                        <p className="font-heading text-2xl font-black text-accent">{totalCommits}</p>
                        <p className="text-[9px] text-slate font-bold uppercase tracking-widest mt-0.5">Total Commits</p>
                      </div>
                    </div>
                  </div>

                  {/* Sync repositories horizontal list */}
                  <div className="mt-5 border-t border-white/[0.06] pt-4">
                    <p className="text-[10px] font-bold text-slate uppercase tracking-wider font-mono mb-3">Sync Directory Tree</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {loadingRepos ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className="min-w-[260px] max-w-[260px] rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 snap-align-start shrink-0 flex flex-col justify-between animate-pulse animate-duration-750"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="h-3 w-28 bg-white/10 rounded" />
                                <div className="h-3 w-12 bg-white/5 rounded" />
                              </div>
                              <div className="space-y-2 mb-4">
                                <div className="h-2 w-full bg-white/5 rounded" />
                                <div className="h-2 w-3/4 bg-white/5 rounded" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-white/[0.04] pt-2">
                              <div className="h-2.5 w-16 bg-white/10 rounded" />
                              <div className="h-2.5 w-20 bg-white/5 rounded" />
                            </div>
                          </div>
                        ))
                      ) : (
                        (repositories.length > 0 ? repositories : [
                          { name: "campus-bandhu-os", description: "Smart Campus Operating System with AI Matching, real-time sync, and glassmorphic dashboards.", language: "TypeScript", forks: 12, stars: 128, tag: "Highest Fork", html_url: `https://github.com/${githubUsername}/campus-bandhu-os` },
                          { name: "ai-matching-radar", description: "Skills compatibility matching engine using cosine similarity calculations and fuzzy match logic.", language: "Python", forks: 8, stars: 242, tag: "Most Star", html_url: `https://github.com/${githubUsername}/ai-matching-radar` },
                          { name: "web3-buildathon-contracts", description: "Smart contracts and decentralized verification logic for NFT credential distribution.", language: "Solidity", forks: 4, stars: 38, tag: "New", html_url: `https://github.com/${githubUsername}/web3-buildathon-contracts` },
                          { name: "leetcode-stats-api", description: "Serverless endpoints to fetch, compile, and visual solve parameters for competitive coding profiles.", language: "TypeScript", forks: 2, stars: 15, tag: "", html_url: `https://github.com/${githubUsername}/leetcode-stats-api` },
                        ]).map((repo) => (
                          <a 
                            key={repo.name} 
                            href={repo.html_url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-[260px] max-w-[260px] rounded-2xl border border-white/[0.04] bg-white/[0.01] p-4 hover:bg-white/[0.03] hover:border-purple/35 transition-all snap-align-start shrink-0 flex flex-col justify-between group/repo cursor-pointer shadow-md"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="font-mono text-xs font-semibold text-white group-hover/repo:text-accent transition-colors truncate max-w-[150px]">{repo.name}</span>
                                {repo.tag && (
                                  <span className={cn(
                                    "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                    repo.tag === "New" && "bg-electric/10 text-electric border border-electric/20",
                                    repo.tag === "Highest Fork" && "bg-purple/10 text-purple border border-purple/20 shadow-glow-xs animate-pulse",
                                    repo.tag === "Most Star" && "bg-mint/10 text-mint border border-mint/20 shadow-glow-xs"
                                  )}>
                                    {repo.tag}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate leading-relaxed line-clamp-2 mb-3">{repo.description}</p>
                            </div>
                            
                            <div className="flex items-center justify-between text-[9px] text-slate border-t border-white/[0.04] pt-2 mt-2 font-mono">
                              <span className="flex items-center gap-1.5 font-bold">
                                <span className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  repo.language === "TypeScript" && "bg-[#3178c6]",
                                  repo.language === "Python" && "bg-[#3572a5]",
                                  repo.language === "Solidity" && "bg-[#f18b11]",
                                  !["TypeScript", "Python", "Solidity"].includes(repo.language) && "bg-accent"
                                )} /> {repo.language}
                              </span>
                              <span className="flex items-center gap-3 font-semibold">
                                <span>🍴 {repo.forks}</span>
                                <span>⭐ {repo.stars}</span>
                              </span>
                            </div>
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </ConsoleWindow>
            </div>
          )}

          {/* Bento Box 4: Creations Directory Showcase (Col-span 2) */}
          <div className="md:col-span-2 lg:col-span-2 flex flex-col">
            <ConsoleWindow title="[json] - creations.json" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div>
                    <h3 className="font-heading text-base font-bold flex items-center gap-2 text-white">
                      <Code2 className="h-5 w-5 text-accent animate-pulse" /> Projects directory
                    </h3>
                    <p className="text-[10px] text-slate font-semibold mt-0.5">Showcase developer builds folder files.</p>
                  </div>
                  <button 
                    onClick={() => setIsAddProjectOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-accent border border-accent/20 bg-accent/5 hover:bg-accent/10 px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors shadow-glow-xs select-none"
                  >
                    <Plus className="h-4 w-4" /> Add Project
                  </button>
                </div>

                {profile?.projects && profile.projects.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {profile.projects.map((proj, i) => (
                      <div key={i} className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.01] to-white/[0.02] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:bg-white/[0.03] hover:border-accent/40 hover:-translate-y-1 hover:shadow-glow-sm p-4">
                        <div>
                          {proj.photoUrl ? (
                            <div className="h-28 w-full rounded-xl overflow-hidden border border-white/[0.04] mb-3 relative">
                              <img src={proj.photoUrl} alt={proj.title} className="h-full w-full object-cover group-hover:scale-105 transition-all duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                                <span className="text-[8px] font-bold text-white bg-accent/75 rounded px-2.5 py-0.5">Active Build</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-28 w-full rounded-xl bg-gradient-to-br from-accent/15 via-purple/10 to-electric/15 border border-white/[0.06] mb-3 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 grid-background opacity-20" />
                              <Code2 className="h-9 w-9 text-accent/30 relative z-10 animate-pulse" />
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start">
                            <h4 className="font-black text-sm text-white truncate max-w-[85%]">{proj.title}</h4>
                            <button 
                              onClick={() => handleDeleteProject(i)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate hover:text-rose cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate mt-1.5 leading-relaxed line-clamp-3 font-semibold">{proj.description}</p>
                        </div>

                        <div className="mt-4 flex gap-2 border-t border-white/[0.04] pt-3">
                          {proj.githubLink && (
                            <a 
                              href={proj.githubLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] py-1.5 text-[9px] font-bold text-white transition-colors"
                            >
                              <Github className="h-3.5 w-3.5" /> GitHub Code
                            </a>
                          )}
                          {proj.youtubeLink && (
                            <a 
                              href={proj.youtubeLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-rose/10 hover:bg-rose/20 py-1.5 text-[9px] font-bold text-rose transition-colors"
                            >
                              🎥 Video Demo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                    <Folder className="h-8 w-8 text-slate/30 mx-auto mb-2" />
                    <p className="text-xs text-slate italic mb-3 font-semibold">No custom projects showcased yet.</p>
                    <button 
                      onClick={() => setIsAddProjectOpen(true)}
                      className="mx-auto flex items-center gap-1 text-[10px] font-bold text-accent cursor-pointer"
                    >
                      Create one now
                    </button>
                  </div>
                )}
              </div>
            </ConsoleWindow>
          </div>

          {/* Bento Box 5: LeetCode Solving status (Col-span 1) */}
          {profile?.leetcodeUrl && (
            <div className="md:col-span-1 lg:col-span-1 flex flex-col">
              <ConsoleWindow title="[leetcode] - analytics.api" className="h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-heading text-base font-bold flex items-center gap-2 text-white">
                    <span className="text-[#FFA116] font-black text-lg animate-pulse">LC</span> Solved metrics
                  </h3>
                  <p className="text-[10px] text-slate font-semibold">// Live solving statistics query</p>

                  <div className="flex flex-col items-center justify-center p-2">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                        <circle cx="48" cy="48" r="40" stroke="#FFA116" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset="129.6" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(255,161,22,0.3)] animate-pulse animate-duration-1000" />
                      </svg>
                      <div className="text-center z-10 font-mono">
                        <p className="font-heading text-2xl font-black text-white">242</p>
                        <p className="text-[8px] text-slate uppercase tracking-widest font-mono font-bold">Solved</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[9px] text-slate mb-1">
                        <span className="font-bold text-white">Easy Problems</span>
                        <span className="font-bold text-mint">142 / 250</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.04]">
                        <div className="h-full bg-mint rounded-full shadow-glow-xs" style={{ width: "56.8%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-slate mb-1">
                        <span className="font-bold text-white">Medium Problems</span>
                        <span className="font-bold text-[#FFA116]">88 / 200</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.04]">
                        <div className="h-full bg-[#FFA116] rounded-full shadow-glow-xs" style={{ width: "44%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-slate mb-1">
                        <span className="font-bold text-white">Hard Problems</span>
                        <span className="font-bold text-rose">12 / 50</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.04]">
                        <div className="h-full bg-rose rounded-full shadow-glow-xs" style={{ width: "24%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Hacker Badges */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-2 text-left font-mono">
                    <p className="text-[9px] text-slate/40 uppercase tracking-widest font-bold font-mono">// Earned Badges</p>
                    <div className="flex gap-2">
                      <div className="floating-card flex-1 rounded-xl bg-white/[0.02] border border-[#FFA116]/25 p-2 text-center transition-all hover:bg-white/[0.04] hover:shadow-glow-xs" title="Solved 50+ Dynamic Programming questions">
                        <span className="text-xl block">🛡️</span>
                        <p className="text-[8px] font-black text-white mt-1">DP Knight</p>
                      </div>
                      <div className="floating-card flex-1 rounded-xl bg-white/[0.02] border border-purple/35 p-2 text-center transition-all hover:bg-white/[0.04]" title="Solved 30+ Graph questions">
                        <span className="text-xl block">🌀</span>
                        <p className="text-[8px] font-black text-white mt-1">Graph</p>
                      </div>
                      <div className="floating-card flex-1 rounded-xl bg-white/[0.02] border border-cyan/35 p-2 text-center transition-all hover:bg-white/[0.04]" title="45 Days Active Streak">
                        <span className="text-xl block">🔥</span>
                        <p className="text-[8px] font-black text-white mt-1">Streak</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ConsoleWindow>
            </div>
          )}

          {/* Bento Box 6: Timeline Journey logs (Col-span 2) */}
          <div className="md:col-span-2 lg:col-span-2 flex flex-col">
            <ConsoleWindow title="[journey] - experience.log" className="h-full flex flex-col justify-between">
              <div className="grid gap-6 sm:grid-cols-2">
                
                {/* Work Experience */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-base font-bold flex items-center gap-2 text-white">
                        <Briefcase className="h-5 w-5 text-mint" /> Work History
                      </h3>
                    </div>
                    <button 
                      onClick={() => setIsAddExperienceOpen(true)}
                      className="flex items-center gap-1 text-[9px] font-bold text-mint border border-mint/20 bg-mint/5 hover:bg-mint/10 px-2.5 py-1.5 rounded-xl cursor-pointer select-none"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>

                  {profile?.experience && profile.experience.length > 0 ? (
                    <div className="relative border-l border-white/[0.08] pl-5 ml-2 space-y-4">
                      {profile.experience.map((exp, i) => (
                        <div key={i} className="group relative bg-white/[0.01] hover:bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.04] flex items-start gap-3 justify-between transition-all duration-300 hover:border-mint/30 hover:shadow-glow-xs">
                          <div className="absolute -left-[29px] top-4.5 h-3.5 w-3.5 rounded-full border border-panel bg-mint shadow-[0_0_10px_rgba(56,242,181,0.5)] group-hover:bg-accent group-hover:shadow-[0_0_15px_rgba(0,212,255,0.7)] transition-all duration-300" />
                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex flex-wrap items-center justify-between gap-x-2">
                              <p className="text-xs font-bold text-white truncate max-w-[65%]">{exp.role}</p>
                              <span className="text-[8px] font-mono text-slate px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.04] font-semibold">{exp.duration}</span>
                            </div>
                            <p className="text-[11px] text-mint font-bold mt-0.5">{exp.company}</p>
                            {exp.description && <p className="text-[11px] text-slate mt-1.5 leading-relaxed font-semibold">{exp.description}</p>}
                          </div>
                          <button 
                            onClick={() => handleDeleteExperience(i)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate hover:text-rose p-1 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate italic font-semibold border border-dashed border-white/10 rounded-xl bg-white/[0.01]">No experience listed yet.</div>
                  )}
                </div>

                {/* Licenses & Credentials */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-base font-bold flex items-center gap-2 text-white">
                        <Award className="h-5 w-5 text-purple" /> Credentials
                      </h3>
                    </div>
                    <button 
                      onClick={() => setIsAddLicenseOpen(true)}
                      className="flex items-center gap-1 text-[9px] font-bold text-purple border border-purple/20 bg-purple/5 hover:bg-purple/10 px-2.5 py-1.5 rounded-xl cursor-pointer select-none"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>

                  {profile?.licenses && profile.licenses.length > 0 ? (
                    <div className="space-y-3">
                      {profile.licenses.map((lic, i) => (
                        <div key={i} className="group relative bg-white/[0.01] hover:bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.04] flex items-start gap-3 justify-between transition-all duration-300 hover:border-purple/35 hover:shadow-glow-xs">
                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-white truncate max-w-[75%]">{lic.name}</p>
                              <span className="text-[8px] font-bold text-purple bg-purple/10 border border-purple/20 px-1 py-0.5 rounded shadow-glow-xs shrink-0">✓ Verified</span>
                            </div>
                            <p className="text-[11px] text-purple font-bold mt-1.5 truncate">{lic.issuer}</p>
                            {lic.issueDate && <p className="text-[8px] text-slate mt-0.5 font-semibold">Issued: {lic.issueDate}</p>}
                            
                            {lic.credentialUrl && (
                              <a 
                                href={lic.credentialUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-1 text-[8px] text-slate hover:text-white mt-1.5 font-bold transition-colors"
                              >
                                <ExternalLink className="h-2.5 w-2.5" /> Source URL
                              </a>
                            )}
                          </div>
                          <button 
                            onClick={() => handleDeleteLicense(i)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate hover:text-rose p-1 cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate italic font-semibold border border-dashed border-white/10 rounded-xl bg-white/[0.01]">No credentials listed yet.</div>
                  )}
                </div>

              </div>
            </ConsoleWindow>
          </div>

          {/* Bento Box 7: Skills Directory tags cloud (Col-span 1) */}
          <div className="md:col-span-1 lg:col-span-1 flex flex-col">
            <ConsoleWindow title="[cfg] - skills.xml" className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-heading text-base font-bold flex items-center gap-2 text-white">
                  <Cpu className="h-5 w-5 text-blaze" /> Skills config
                </h3>
                <p className="text-[10px] text-slate font-semibold">// Technical inventory list data</p>

                <div className="space-y-3 text-left">
                  {(Object.keys(groupedSkills) as Array<keyof typeof groupedSkills>).map((category) => {
                    const skillsList = groupedSkills[category];
                    if (!skillsList || skillsList.length === 0) return null;
                    return (
                      <div key={category} className="p-3 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                        <p className="text-[8px] font-bold text-slate uppercase tracking-wider font-mono mb-2">{category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {skillsList.map((skill) => (
                            <NeonBadge key={skill} color="blue" size="sm">
                              {skill}
                            </NeonBadge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {userSkills.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate italic font-semibold border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">No core skills config detected.</div>
                  )}
                </div>
              </div>

              {/* Interests hashtags */}
              <div className="mt-5 border-t border-white/[0.06] pt-4 text-left">
                <p className="text-[9px] font-mono text-slate/50 uppercase tracking-widest font-bold mb-2">// Hobbies & Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.interests && profile.interests.length > 0 ? (
                    profile.interests.map((tag) => (
                      <span key={tag} className="rounded-lg bg-cyan/10 border border-cyan/20 px-2 py-0.5 text-[10px] font-bold text-cyan shadow-glow-xs">
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate italic font-semibold">No config items found.</p>
                  )}
                </div>
              </div>
            </ConsoleWindow>
          </div>

        </div>

        {/* NFT achievements collection dashboard */}
        <ConsoleWindow title="[bash] - unlockables.sh" className="w-full text-left rounded-3xl">
          <h3 className="font-heading text-base font-bold flex items-center gap-2 text-purple mb-4">
            <Trophy className="h-5 w-5 text-purple" /> Unlocked achievements
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {achievements.map((ach, i) => (
              <div
                key={i}
                className={cn(
                  "group relative rounded-2xl border bg-gradient-to-b from-white/[0.01] to-white/[0.02] p-3.5 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.03] shadow-md",
                  ach.rarity === "Legendary" && "border-blaze/25 hover:border-blaze hover:shadow-[0_0_20px_rgba(255,122,24,0.15)]",
                  ach.rarity === "Epic" && "border-purple/25 hover:border-purple hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
                  ach.rarity === "Rare" && "border-cyan/25 hover:border-cyan hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]",
                  ach.rarity === "Common" && "border-white/10 hover:border-white/20"
                )}
              >
                <span className="text-2xl block filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300">{ach.icon}</span>
                <p className="mt-2 text-[10px] font-black text-white">{ach.title}</p>
                <p className="text-[9px] text-slate mt-0.5 leading-normal font-semibold">{ach.description}</p>
                
                <NeonBadge color={(rarityColors[ach.rarity] || "blue") as any} size="sm" className="mt-2 text-[8px]">
                  {ach.rarity}
                </NeonBadge>
              </div>
            ))}
          </div>
        </ConsoleWindow>

      </motion.div>

      {/* Edit Profile Modal */}
      <Modal open={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile Details" variant="hacker" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              placeholder="Full name" 
              value={editData.fullName}
              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
              required
            />
            <Input 
              label="Department / Course" 
              placeholder="e.g. Computer Science" 
              value={editData.department}
              onChange={(e) => setEditData({ ...editData, department: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="Graduation Year" 
              type="number"
              placeholder="e.g. 2025" 
              value={editData.graduationYear}
              onChange={(e) => setEditData({ ...editData, graduationYear: Number(e.target.value) || 2025 })}
              required
            />
            <Input 
              label="Email Address" 
              type="email"
              placeholder="youanindya1@gmail.com" 
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
            <div className="w-full">
              <label className="mb-1.5 block text-xs font-medium text-slate">Gender</label>
              <select
                value={editData.gender}
                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                className="h-10 w-full rounded-xl border border-white/10 bg-[#070b15]/75 px-3 text-xs text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none font-mono"
              >
                <option value="Undeclared">Undeclared</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="College / University Name" 
              placeholder="e.g. NSUT, New Delhi" 
              value={editData.collegeName}
              onChange={(e) => setEditData({ ...editData, collegeName: e.target.value })}
            />
            <Input 
              label="Resume Drive / File URL" 
              placeholder="https://drive.google.com/..." 
              value={editData.resumeUrl}
              onChange={(e) => setEditData({ ...editData, resumeUrl: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-white/[0.06] pt-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate">Profile Picture (Avatar)</label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById("avatar-file-modal")?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/[0.08] hover:border-mint/30 transition-all cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-mint" /> Upload Photo
                </button>
                <input
                  type="file"
                  id="avatar-file-modal"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert("Image must be under 2MB");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const result = reader.result;
                        if (typeof result === "string") {
                          setEditData(prev => ({ ...prev, avatarUrl: result }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Input 
                  placeholder="Or paste avatar image URL" 
                  value={editData.avatarUrl}
                  onChange={(e) => setEditData({ ...editData, avatarUrl: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate">Cover Photo (Banner)</label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById("cover-file-modal")?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/[0.08] hover:border-mint/30 transition-all cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-mint" /> Upload Cover
                </button>
                <input
                  type="file"
                  id="cover-file-modal"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert("Image must be under 2MB");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const result = reader.result;
                        if (typeof result === "string") {
                          setEditData(prev => ({ ...prev, coverPhotoUrl: result }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Input 
                  placeholder="Or paste cover image URL" 
                  value={editData.coverPhotoUrl}
                  onChange={(e) => setEditData({ ...editData, coverPhotoUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-3">
            <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Connected Profiles</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="LeetCode Profile URL" 
                placeholder="https://leetcode.com/username" 
                value={editData.leetcodeUrl}
                onChange={(e) => setEditData({ ...editData, leetcodeUrl: e.target.value })}
              />
              <Input 
                label="ORCID iD / URL" 
                placeholder="https://orcid.org/0000-0002-1825-0097" 
                value={editData.orcidUrl}
                onChange={(e) => setEditData({ ...editData, orcidUrl: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate mb-1 block">Bio / Summary</label>
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className="w-full rounded-xl border border-white/[0.06] bg-[#070b15]/75 p-3 text-xs text-white placeholder:text-subtle focus:border-accent/50 focus:outline-none min-h-[80px] font-mono"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <label className="mb-1.5 block text-xs font-semibold text-slate">
                Skills (Select 1 to 5)
              </label>
              
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[40px] p-2 rounded-xl bg-black/25 border border-white/[0.04]">
                {editData.skills.length > 0 ? (
                  editData.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="inline-flex items-center gap-1 rounded-md bg-mint/10 border border-mint/20 px-2 py-0.5 text-[10px] text-mint shadow-glow-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editData.skills.filter(s => s !== skill);
                          setEditData({ ...editData, skills: updated });
                        }}
                        className="text-mint/60 hover:text-mint hover:bg-mint/10 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold text-[9px] cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-subtle italic select-none">No skills selected (Minimum 1 required)</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1.5 border border-white/10 bg-white/[0.02] rounded-xl">
                {PREDEFINED_SKILLS.map((skill) => {
                  const isSelected = editData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      disabled={!isSelected && editData.skills.length >= 5}
                      onClick={() => {
                        if (isSelected) {
                          const updated = editData.skills.filter(s => s !== skill);
                          setEditData({ ...editData, skills: updated });
                        } else {
                          if (editData.skills.length < 5) {
                            setEditData({ ...editData, skills: [...editData.skills, skill] });
                          }
                        }
                      }}
                      className={`px-2 py-1 text-[9px] font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-mint/10 border-mint/30 text-mint shadow-glow-sm"
                          : "bg-white/[0.02] border-white/10 text-slate hover:bg-white/[0.06] hover:text-white disabled:opacity-35 disabled:cursor-not-allowed"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input 
              label="Interests (comma separated)" 
              placeholder="ai, web3, design" 
              value={editData.interests}
              onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="GitHub Profile URL" 
              type="url"
              placeholder="https://github.com/username" 
              value={editData.githubUrl}
              onChange={(e) => setEditData({ ...editData, githubUrl: e.target.value })}
            />
            <Input 
              label="LinkedIn Profile URL" 
              type="url"
              placeholder="https://linkedin.com/in/username" 
              value={editData.linkedinUrl}
              onChange={(e) => setEditData({ ...editData, linkedinUrl: e.target.value })}
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-mint to-accent py-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(56,242,181,0.2)] transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(56,242,181,0.35)] cursor-pointer select-none active:scale-[0.99] font-mono"
          >
            EXECUTE: Save Changes to Database
          </button>
        </div>
      </Modal>

      {/* Add Project Modal */}
      <Modal open={isAddProjectOpen} onClose={() => setIsAddProjectOpen(false)} title="Add Project Showcase" variant="hacker" size="md">
        <form onSubmit={handleAddProject} className="space-y-4 p-1">
          <Input 
            label="Project Title" 
            placeholder="e.g. Campus Bandhu App" 
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            required
          />
          <div>
            <label className="text-xs text-slate mb-1 block">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full rounded-xl border border-white/[0.06] bg-[#070b15]/75 p-3 text-xs text-white placeholder:text-subtle focus:border-accent/50 focus:outline-none min-h-[80px] font-mono"
              placeholder="Explain what your project does..."
              required
            />
          </div>
          
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate">Project Image / Banner</label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => document.getElementById("project-photo-modal")?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.02] border border-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/[0.06] hover:border-accent/40 hover:text-accent transition-all cursor-pointer font-mono"
              >
                <Upload className="h-3.5 w-3.5 text-accent" /> Upload Project Banner
              </button>
              <input
                type="file"
                id="project-photo-modal"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      alert("Image must be under 2MB");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const result = reader.result;
                      if (typeof result === "string") {
                        setNewProject(prev => ({ ...prev, photoUrl: result }));
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <Input 
                placeholder="Or paste direct image URL" 
                value={newProject.photoUrl}
                onChange={(e) => setNewProject({ ...newProject, photoUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="GitHub Repo Link" 
              placeholder="https://github.com/..." 
              value={newProject.githubLink}
              onChange={(e) => setNewProject({ ...newProject, githubLink: e.target.value })}
            />
            <Input 
              label="YouTube Video Link" 
              placeholder="https://youtube.com/..." 
              value={newProject.youtubeLink}
              onChange={(e) => setNewProject({ ...newProject, youtubeLink: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-accent to-purple py-3 text-xs font-bold text-white cursor-pointer shadow-glow-sm hover:scale-[1.01] transition-all active:scale-[0.99] select-none font-mono"
          >
            EXECUTE: Add Project
          </button>
        </form>
      </Modal>

      {/* Add Experience Modal */}
      <Modal open={isAddExperienceOpen} onClose={() => setIsAddExperienceOpen(false)} title="Add Work Experience" variant="hacker" size="md">
        <form onSubmit={handleAddExperience} className="space-y-4 p-1">
          <Input 
            label="Job / Internship Role" 
            placeholder="e.g. Fullstack Engineer Intern" 
            value={newExperience.role}
            onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
            required
          />
          <Input 
            label="Company / Club Name" 
            placeholder="e.g. Google DeepMind" 
            value={newExperience.company}
            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
            required
          />
          <Input 
            label="Duration" 
            placeholder="e.g. Jun 2023 - Present or Summer 2024" 
            value={newExperience.duration}
            onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
            required
          />
          <div>
            <label className="text-xs text-slate mb-1 block">Description (Optional)</label>
            <textarea
              value={newExperience.description}
              onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
              className="w-full rounded-xl border border-white/[0.06] bg-[#070b15]/75 p-3 text-xs text-white placeholder:text-subtle focus:border-accent/50 focus:outline-none min-h-[80px] font-mono"
              placeholder="Highlight your key achievements and contributions..."
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-mint to-electric py-3 text-xs font-bold text-white cursor-pointer shadow-glow-sm hover:scale-[1.01] transition-all active:scale-[0.99] select-none font-mono"
          >
            EXECUTE: Add Experience
          </button>
        </form>
      </Modal>

      {/* Add License Modal */}
      <Modal open={isAddLicenseOpen} onClose={() => setIsAddLicenseOpen(false)} title="Add License / Certification" variant="hacker" size="md">
        <form onSubmit={handleAddLicense} className="space-y-4 p-1">
          <Input 
            label="Certification Name" 
            placeholder="e.g. AWS Certified Solutions Architect" 
            value={newLicense.name}
            onChange={(e) => setNewLicense({ ...newLicense, name: e.target.value })}
            required
          />
          <Input 
            label="Issuing Authority" 
            placeholder="e.g. Amazon Web Services" 
            value={newLicense.issuer}
            onChange={(e) => setNewLicense({ ...newLicense, issuer: e.target.value })}
            required
          />
          <Input 
            label="Issue Date (Optional)" 
            placeholder="e.g. September 2024" 
            value={newLicense.issueDate}
            onChange={(e) => setNewLicense({ ...newLicense, issueDate: e.target.value })}
          />
          <Input 
            label="Credential Verification Link" 
            placeholder="https://credly.com/..." 
            value={newLicense.credentialUrl}
            onChange={(e) => setNewLicense({ ...newLicense, credentialUrl: e.target.value })}
          />
          <button
            type="submit"
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-purple to-electric py-3 text-xs font-bold text-white cursor-pointer shadow-glow-sm hover:scale-[1.01] transition-all active:scale-[0.99] select-none font-mono"
          >
            EXECUTE: Add Certificate
          </button>
        </form>
      </Modal>

      {/* Avatar Options Modal */}
      <Modal open={avatarMenuOpen} onClose={() => setAvatarMenuOpen(false)} title="Profile Picture Options" variant="hacker" size="sm">
        <div className="space-y-3 p-1">
          {profile?.avatarUrl && (
            <button
              onClick={() => {
                setAvatarMenuOpen(false);
                setLightboxImage({ src: profile.avatarUrl!, title: "Profile Picture" });
              }}
              className="w-full text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-accent/40 hover:text-accent px-4 py-3.5 text-xs font-bold text-white transition-all flex items-center gap-3 cursor-pointer select-none font-mono"
            >
              &gt; 👁️ VIEW_FULL_IMAGE
            </button>
          )}
          <button
            onClick={() => {
              setAvatarMenuOpen(false);
              document.getElementById("avatar-file-input-header")?.click();
            }}
            className="w-full text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-accent/40 hover:text-accent px-4 py-3.5 text-xs font-bold text-white transition-all flex items-center gap-3 cursor-pointer select-none font-mono"
          >
            &gt; 📤 UPLOAD_NEW_IMAGE
          </button>

          {profile?.avatarUrl && (
            <button
              onClick={async () => {
                setAvatarMenuOpen(false);
                if (confirm("Are you sure you want to remove your profile picture?")) {
                  await updateProfile({ avatarUrl: "" });
                }
              }}
              className="w-full text-left rounded-xl bg-rose-950/10 hover:bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 px-4 py-3.5 text-xs font-bold text-rose-400 transition-all flex items-center gap-3 cursor-pointer select-none font-mono"
            >
              &gt; ❌ DELETE_CURRENT_IMAGE
            </button>
          )}
        </div>
      </Modal>

      {/* Cover Options Modal */}
      <Modal open={coverMenuOpen} onClose={() => setCoverMenuOpen(false)} title="Cover Photo Options" variant="hacker" size="sm">
        <div className="space-y-3 p-1">
          {profile?.coverPhotoUrl && (
            <button
              onClick={() => {
                setCoverMenuOpen(false);
                setLightboxImage({ src: profile.coverPhotoUrl!, title: "Cover Photo" });
              }}
              className="w-full text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-accent/40 hover:text-accent px-4 py-3.5 text-xs font-bold text-white transition-all flex items-center gap-3 cursor-pointer select-none font-mono"
            >
              &gt; 👁️ VIEW_FULL_BANNER
            </button>
          )}
          <button
            onClick={() => {
              setCoverMenuOpen(false);
              document.getElementById("cover-file-input-header")?.click();
            }}
            className="w-full text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-accent/40 hover:text-accent px-4 py-3.5 text-xs font-bold text-white transition-all flex items-center gap-3 cursor-pointer select-none font-mono"
          >
            &gt; 📤 UPLOAD_NEW_BANNER
          </button>
          <button
            onClick={() => {
              setCoverMenuOpen(false);
              setIsRepositioningCover(true);
            }}
            className="w-full text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-accent/40 hover:text-accent px-4 py-3.5 text-xs font-bold text-white transition-all flex items-center gap-3 cursor-pointer select-none font-mono"
          >
            &gt; ⚙️ REPOSITION_BANNER
          </button>
          {profile?.coverPhotoUrl && (
            <button
              onClick={async () => {
                setCoverMenuOpen(false);
                if (confirm("Are you sure you want to remove your cover photo?")) {
                  await updateProfile({ coverPhotoUrl: "" });
                }
              }}
              className="w-full text-left rounded-xl bg-rose-950/10 hover:bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 px-4 py-3.5 text-xs font-bold text-rose-400 transition-all flex items-center gap-3 cursor-pointer select-none font-mono"
            >
              &gt; ❌ DELETE_CURRENT_BANNER
            </button>
          )}
        </div>
      </Modal>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-all duration-300 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-slate bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-xl border border-white/10 flex flex-col items-center p-2 bg-[#12121A]">
            <img 
              src={lightboxImage.src} 
              alt={lightboxImage.title} 
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
            <span className="mt-2 text-sm text-slate font-medium">{lightboxImage.title}</span>
          </div>
        </div>
      )}
    </AppShell>
  );
}
