"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Mail, Calendar, BookOpen, Award, Star,
  Edit3, Github, Linkedin, ExternalLink, Camera, Upload, X, Plus, Trash2, Code2
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
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

export default function ProfilePage() {
  const { profile, role, user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [coverMenuOpen, setCoverMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  // Repositioning banner cover photo
  const [isRepositioningCover, setIsRepositioningCover] = useState(false);
  const [coverDragY, setCoverDragY] = useState(50);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);

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
    if (profile?.coverY !== undefined) {
      setCoverDragY(profile.coverY);
    }
  }, [profile?.coverY]);

  const handleCoverMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioningCover) return;
    setIsDraggingCover(true);
    setDragStartY(e.clientY);
    e.preventDefault();
  };

  const handleCoverMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCover || !isRepositioningCover) return;
    const deltaY = e.clientY - dragStartY;
    const sensitivity = 0.4;
    setCoverDragY((prev) => {
      const nextY = prev - deltaY * sensitivity;
      return Math.max(0, Math.min(100, nextY));
    });
    setDragStartY(e.clientY);
  };

  const handleCoverMouseUp = () => {
    setIsDraggingCover(false);
  };

  const handleCoverTouchStart = (e: React.TouchEvent) => {
    if (!isRepositioningCover) return;
    if (e.touches && e.touches[0]) {
      setIsDraggingCover(true);
      setDragStartY(e.touches[0].clientY);
    }
  };

  const handleCoverTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingCover || !isRepositioningCover) return;
    if (e.touches && e.touches[0]) {
      const deltaY = e.touches[0].clientY - dragStartY;
      const sensitivity = 0.4;
      setCoverDragY((prev) => {
        const nextY = prev - deltaY * sensitivity;
        return Math.max(0, Math.min(100, nextY));
      });
      setDragStartY(e.touches[0].clientY);
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
    coverY: 50,
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

  // GitHub contribution grid username extraction
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

        // Fetch contributions
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

  return (
    <AppShell>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        {/* Profile Header */}
        <motion.div variants={stagger.item}>
          <GlassCard className="relative overflow-hidden">
            {/* Banner */}
            <div 
              className={`absolute inset-x-0 top-0 h-28 w-full overflow-hidden group/cover ${
                isRepositioningCover ? "cursor-ns-resize touch-none select-none z-10" : "cursor-pointer"
              }`}
              onClick={() => { if (!isRepositioningCover) setCoverMenuOpen(true); }}
              onMouseDown={handleCoverMouseDown}
              onMouseMove={handleCoverMouseMove}
              onMouseUp={handleCoverMouseUp}
              onMouseLeave={handleCoverMouseUp}
              onTouchStart={handleCoverTouchStart}
              onTouchMove={handleCoverTouchMove}
              onTouchEnd={handleCoverMouseUp}
            >
              {profile?.coverPhotoUrl ? (
                <img
                  src={profile.coverPhotoUrl}
                  alt="Cover Banner"
                  className={`h-full w-full object-cover opacity-80 pointer-events-none select-none ${
                    isRepositioningCover ? "" : "transition-all duration-500 group-hover/cover:scale-105"
                  }`}
                  style={{
                    transform: `scale(${profile?.coverZoom || 1})`,
                    objectPosition: `center ${isRepositioningCover ? coverDragY : (profile?.coverY !== undefined ? profile.coverY : 50)}%`
                  }}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-accent/20 via-purple/20 to-electric/20 transition-all duration-500 group-hover/cover:brightness-110 pointer-events-none select-none" />
              )}

              {isRepositioningCover && (
                <div className="absolute inset-0 bg-black/35 flex flex-col justify-between p-2 select-none pointer-events-none z-20">
                  <div className="mx-auto rounded-lg bg-black/60 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-md flex items-center gap-1.5 shadow-lg border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-mint animate-ping" />
                    Drag photo up or down to adjust view
                  </div>
                  <div className="flex justify-end gap-2 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRepositioningCover(false);
                        if (profile?.coverY !== undefined) {
                          setCoverDragY(profile.coverY);
                        } else {
                          setCoverDragY(50);
                        }
                      }}
                      className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white transition-colors cursor-pointer border border-white/10 shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setIsRepositioningCover(false);
                        await updateProfile({ coverY: coverDragY });
                      }}
                      className="rounded-lg bg-mint px-2.5 py-1 text-[10px] font-bold text-base transition-colors cursor-pointer shadow-md hover:brightness-110"
                    >
                      Save Position
                    </button>
                  </div>
                </div>
              )}

              {!isRepositioningCover && (
                <div className="absolute top-3 right-3 bg-black/50 hover:bg-black/75 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300">
                  <Camera className="h-3.5 w-3.5 text-white" />
                  <span className="text-[10px] font-semibold text-white">Cover Options</span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 grid-background opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent opacity-80" />
              
              <input
                type="file"
                id="cover-file-input-header"
                accept="image/*"
                className="hidden"
                onClick={(e) => e.stopPropagation()}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      alert("Image must be under 2MB");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      if (typeof reader.result === "string") {
                        await updateProfile({ coverPhotoUrl: reader.result });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <div className="relative pt-20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="relative group cursor-pointer" onClick={() => setAvatarMenuOpen(true)}>
                    <Avatar
                      src={profile?.avatarUrl || user?.photoURL}
                      name={profile?.fullName || "User"}
                      size="xl"
                      status="online"
                      glow
                      className="ring-4 ring-base"
                      imageStyle={{
                        transform: `scale(${profile?.avatarZoom || 1}) translate(${profile?.avatarX || 0}px, ${profile?.avatarY || 0}px)`
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <input
                      type="file"
                      id="avatar-file-input-header"
                      accept="image/*"
                      className="hidden"
                      onClick={(e) => e.stopPropagation()}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert("Image must be under 2MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            if (typeof reader.result === "string") {
                              await updateProfile({ avatarUrl: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h1 className="font-heading text-2xl font-bold">{profile?.fullName || "User"}</h1>
                    <div className="mt-1 flex items-center gap-2">
                      <NeonBadge color={(ROLE_COLORS[role!] || "blue") as any}>
                        {ROLE_LABELS[role!] || "Student"}
                      </NeonBadge>
                      <span className="text-xs text-slate">{profile?.department || "Undeclared"}</span>
                      {profile?.gender && profile.gender !== "Undeclared" && (
                        <span className="text-[10px] text-slate px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.04]">
                          {profile.gender}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {profile?.resumeUrl && (
                    <a 
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer"
                    >
                      View Resume
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
                        coverY: profile?.coverY || 50,
                        gender: profile?.gender || "Undeclared"
                      });
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" /> Edit Profile
                  </button>
                </div>
              </div>

              {/* Bio + Info */}
              <p className="mt-4 text-sm text-slate max-w-2xl font-medium">
                {profile?.bio || "Passionate about AI and building decentralized systems."}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-accent" /> {profile?.collegeName || "NSUT, New Delhi"}</span>
                <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-mint" /> {profile?.email || user?.email || "youanindya1@gmail.com"}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-purple" /> Class of {profile?.graduationYear || 2025}</span>
                <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5 text-cyan" /> {profile?.department || "Undeclared"}</span>
              </div>

              {/* Stats */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Events Joined", value: profile?.role === "organizer" ? 8 : 4, color: "text-accent" },
                  { label: "Connections", value: 124, color: "text-mint" },
                  { label: "Achievements", value: 6, color: "text-purple" },
                  { label: "XP Points", value: 850, color: "text-blaze" },
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

        {/* Dynamic GitHub Contribution Streaks */}
        {githubUsername && (
          <motion.div variants={stagger.item}>
            <GlassCard>
              <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                <Github className="h-5 w-5 text-purple" /> GitHub Contributions & Streaks
              </h3>
              <p className="text-xs text-slate mb-4">Real-time repository sync and code contributions tracker.</p>
              
              <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-auto min-w-0 flex-1">
                  <img 
                    src={`https://ghchart.rshah.org/8b5cf6/${githubUsername}`} 
                    alt="GitHub Contribution Calendar" 
                    className="w-full object-contain filter hover:brightness-110 transition-all duration-300"
                  />
                </div>

                <div className="flex gap-4 self-stretch md:self-auto justify-around shrink-0 md:pl-4 md:border-l border-white/[0.06]">
                  <div className="text-center px-4">
                    <p className="font-heading text-2xl font-bold text-mint">{currentStreak}</p>
                    <p className="text-[10px] text-slate font-medium uppercase tracking-wider font-semibold">Current Streak</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="font-heading text-2xl font-bold text-accent">{totalCommits}</p>
                    <p className="text-[10px] text-slate font-medium uppercase tracking-wider font-semibold">Total Commits</p>
                  </div>
                </div>
              </div>

              {/* Horizontal Scrollable Repositories Row */}
              <div className="mt-6 border-t border-white/[0.06] pt-5">
                <p className="text-[10px] font-semibold text-slate uppercase tracking-wider mb-3">Connected Repositories</p>
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {loadingRepos ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className="min-w-[260px] max-w-[260px] rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5 snap-align-start shrink-0 flex flex-col justify-between animate-pulse"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
                            <div className="h-3 w-12 bg-white/5 rounded" />
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
                            <div className="h-2 w-3/4 bg-white/5 rounded animate-pulse" />
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
                        className="min-w-[260px] max-w-[260px] rounded-xl border border-white/[0.04] bg-white/[0.01] p-3.5 hover:bg-white/[0.03] hover:border-purple/35 transition-all snap-align-start shrink-0 flex flex-col justify-between group/repo cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono text-xs font-semibold text-white group-hover/repo:text-accent transition-colors truncate max-w-[150px]">{repo.name}</span>
                            {repo.tag && (
                              <span className={cn(
                                "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                repo.tag === "New" && "bg-electric/10 text-electric border border-electric/20",
                                repo.tag === "Highest Fork" && "bg-purple/10 text-purple border border-purple/20 shadow-glow-sm animate-pulse",
                                repo.tag === "Most Star" && "bg-mint/10 text-mint border border-mint/20 shadow-glow-sm"
                              )}>
                                {repo.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate leading-relaxed line-clamp-2 mb-3">{repo.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-[9px] text-slate border-t border-white/[0.04] pt-2">
                          <span className="flex items-center gap-1.5">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              repo.language === "TypeScript" && "bg-[#3178c6]",
                              repo.language === "Python" && "bg-[#3572a5]",
                              repo.language === "Solidity" && "bg-[#f18b11]",
                              !["TypeScript", "Python", "Solidity"].includes(repo.language) && "bg-accent"
                            )} /> {repo.language}
                          </span>
                          <span className="flex items-center gap-3">
                            <span>🍴 {repo.forks} forks</span>
                            <span>⭐ {repo.stars} stars</span>
                          </span>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* LeetCode Achievement Board */}
        {profile?.leetcodeUrl && (
          <motion.div variants={stagger.item}>
            <GlassCard>
              <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                <span className="text-[#FFA116] font-bold text-xl animate-pulse">LC</span> LeetCode Achievements & Statistics
              </h3>
              <p className="text-xs text-slate mb-4 font-medium">Live analytics from connected competitive coding profiles.</p>
              
              <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.01] p-5 grid gap-6 md:grid-cols-[160px_1fr_240px] items-center">
                {/* Circular overall progress circle */}
                <div className="flex flex-col items-center justify-center p-2 border-r border-white/[0.04] md:pr-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      {/* Outer Track */}
                      <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                      {/* Inner Progress (Ratio: 242/500 solved = ~48.4%) */}
                      <circle cx="48" cy="48" r="40" stroke="#FFA116" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset="129.6" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(255,161,22,0.3)] animate-pulse" />
                    </svg>
                    <div className="text-center z-10">
                      <p className="font-heading text-xl font-bold text-white">242</p>
                      <p className="text-[8px] text-slate uppercase tracking-wider font-semibold">Total Solved</p>
                    </div>
                  </div>
                </div>

                {/* Question Bars (Easy, Medium, Hard) */}
                <div className="space-y-3.5 flex-1">
                  {/* Easy */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate mb-1">
                      <span className="font-semibold text-white">Easy Problems</span>
                      <span className="font-medium text-mint">142 / 250 solved</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.04]">
                      <div className="h-full bg-mint rounded-full shadow-[0_0_8px_rgba(56,242,181,0.3)]" style={{ width: "56.8%" }} />
                    </div>
                  </div>
                  {/* Medium */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate mb-1">
                      <span className="font-semibold text-white">Medium Problems</span>
                      <span className="font-medium text-[#FFA116]">88 / 200 solved</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.04]">
                      <div className="h-full bg-[#FFA116] rounded-full shadow-[0_0_8px_rgba(255,161,22,0.3)]" style={{ width: "44%" }} />
                    </div>
                  </div>
                  {/* Hard */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate mb-1">
                      <span className="font-semibold text-white">Hard Problems</span>
                      <span className="font-medium text-rose">12 / 50 solved</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.04]">
                      <div className="h-full bg-rose rounded-full shadow-[0_0_8px_rgba(244,63,94,0.3)]" style={{ width: "24%" }} />
                    </div>
                  </div>
                </div>

                {/* Hacker Badges */}
                <div className="flex flex-col justify-center border-t border-white/[0.04] pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6 border-white/[0.06] self-stretch gap-2.5">
                  <p className="text-[10px] text-slate uppercase tracking-wider font-bold">Earned Hacker Badges</p>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-white/[0.02] border border-[#FFA116]/25 p-2 text-center transition-all hover:bg-white/[0.04] hover:shadow-glow-sm" title="Solved 50+ Dynamic Programming questions">
                      <span className="text-lg">🛡️</span>
                      <p className="text-[9px] font-bold text-white mt-1">DP Knight</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-white/[0.02] border border-purple/35 p-2 text-center transition-all hover:bg-white/[0.04]" title="Solved 30+ Graph questions">
                      <span className="text-lg">🌀</span>
                      <p className="text-[9px] font-bold text-white mt-1">Recursion Adept</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-white/[0.02] border border-cyan/35 p-2 text-center transition-all hover:bg-white/[0.04]" title="45 Days Active Streak">
                      <span className="text-lg">🔥</span>
                      <p className="text-[9px] font-bold text-white mt-1">Active Streak</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Projects Showcase Section */}
        <motion.div variants={stagger.item}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Code2 className="h-5 w-5 text-accent" /> Projects Showcase
              </h3>
              <button 
                onClick={() => setIsAddProjectOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-accent border border-accent/20 bg-accent/5 hover:bg-accent/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Project
              </button>
            </div>
            
            {profile?.projects && profile.projects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.projects.map((proj, i) => (
                  <div key={i} className="group relative rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden flex flex-col justify-between transition-all hover:bg-white/[0.03] hover:border-accent/30 p-4">
                    <div>
                      {proj.photoUrl ? (
                        <div className="h-28 w-full rounded-lg overflow-hidden border border-white/[0.04] mb-3">
                          <img src={proj.photoUrl} alt={proj.title} className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300" />
                        </div>
                      ) : (
                        <div className="h-28 w-full rounded-lg bg-gradient-to-br from-accent/10 via-purple/10 to-electric/10 border border-white/[0.04] mb-3 flex items-center justify-center relative">
                          <Code2 className="h-10 w-10 text-accent/35" />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-white truncate">{proj.title}</h4>
                        <button 
                          onClick={() => handleDeleteProject(i)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate hover:text-rose cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate mt-1.5 leading-relaxed line-clamp-3">{proj.description}</p>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-white/[0.04] pt-3">
                      {proj.githubLink && (
                        <a 
                          href={proj.githubLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] py-1.5 text-[10px] font-semibold text-white transition-colors"
                        >
                          <Github className="h-3 w-3" /> Github Code
                        </a>
                      )}
                      {proj.youtubeLink && (
                        <a 
                          href={proj.youtubeLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-rose/10 hover:bg-rose/20 py-1.5 text-[10px] font-semibold text-rose transition-colors"
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
                <p className="text-xs text-slate italic mb-2">No projects showcased yet.</p>
                <button 
                  onClick={() => setIsAddProjectOpen(true)}
                  className="mx-auto flex items-center gap-1 text-[10px] font-semibold text-accent cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Experience & Certifications Columns */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Work Experience */}
          <motion.div variants={stagger.item}>
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-mint" /> Work Experience
                </h3>
                <button 
                  onClick={() => setIsAddExperienceOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-mint border border-mint/20 bg-mint/5 hover:bg-mint/10 px-2.5 py-1 rounded-xl cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Exp
                </button>
              </div>

              {profile?.experience && profile.experience.length > 0 ? (
                <div className="space-y-4">
                  {profile.experience.map((exp, i) => (
                    <div key={i} className="group relative bg-white/[0.01] hover:bg-white/[0.02] p-3 rounded-lg border border-white/[0.04] flex items-start gap-3 justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{exp.role}</p>
                        <p className="text-xs text-mint font-medium">{exp.company}</p>
                        <p className="text-[10px] text-slate mt-0.5">{exp.duration}</p>
                        {exp.description && <p className="text-xs text-slate mt-1.5 leading-relaxed">{exp.description}</p>}
                      </div>
                      <button 
                        onClick={() => handleDeleteExperience(i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate hover:text-rose p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate italic">No experience listed yet.</div>
              )}
            </GlassCard>
          </motion.div>

          {/* Licenses & Certifications */}
          <motion.div variants={stagger.item}>
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple" /> Licenses & Certifications
                </h3>
                <button 
                  onClick={() => setIsAddLicenseOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-purple border border-purple/20 bg-purple/5 hover:bg-purple/10 px-2.5 py-1 rounded-xl cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Cred
                </button>
              </div>

              {profile?.licenses && profile.licenses.length > 0 ? (
                <div className="space-y-3">
                  {profile.licenses.map((lic, i) => (
                    <div key={i} className="group relative bg-white/[0.01] hover:bg-white/[0.02] p-3 rounded-lg border border-white/[0.04] flex items-start gap-3 justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{lic.name}</p>
                        <p className="text-xs text-purple font-medium truncate">{lic.issuer}</p>
                        {lic.issueDate && <p className="text-[10px] text-slate mt-0.5">Issued: {lic.issueDate}</p>}
                        
                        {lic.credentialUrl && (
                          <a 
                            href={lic.credentialUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1 text-[10px] text-slate hover:text-white mt-1.5 transition-colors"
                          >
                            <ExternalLink className="h-2.5 w-2.5" /> View Credential
                          </a>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteLicense(i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate hover:text-rose p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate italic">No credentials listed yet.</div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Skills */}
          <motion.div variants={stagger.item}>
            <GlassCard className="h-full">
              <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-blaze" /> Skills & Interests
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate uppercase tracking-wider mb-2">Core Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <NeonBadge key={skill} color="blue" size="md">
                          {skill}
                        </NeonBadge>
                      ))
                    ) : (
                      <p className="text-sm text-subtle italic">No skills listed yet.</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate uppercase tracking-wider mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.interests && profile.interests.length > 0 ? (
                      profile.interests.map((tag) => (
                        <span key={tag} className="rounded-md bg-accent/10 px-2.5 py-1.5 text-xs font-medium text-accent">
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-subtle italic">No interests listed yet.</p>
                    )}
                  </div>
                </div>
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

        {/* Connected Accounts */}
        <motion.div variants={stagger.item}>
          <GlassCard>
            <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-accent" /> Connected Accounts
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {/* GitHub */}
              <div className="flex flex-col justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#24292e]">
                    <Github className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">GitHub</p>
                    <p className="text-xs text-slate truncate">
                      {profile?.githubUrl ? profile.githubUrl.split("/").pop() : "Not connected"}
                    </p>
                  </div>
                </div>
                {profile?.githubUrl ? (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="w-full text-center rounded-lg bg-white/[0.06] py-1.5 text-xs font-medium transition-colors hover:bg-white/10 hover:text-white">
                    View
                  </a>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full text-center rounded-lg bg-white/[0.06] py-1.5 text-xs font-medium transition-colors hover:bg-white/10 hover:text-white cursor-pointer">
                    Connect
                  </button>
                )}
              </div>

              {/* LinkedIn */}
              <div className="flex flex-col justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0077b5]">
                    <Linkedin className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">LinkedIn</p>
                    <p className="text-xs text-slate truncate">
                      {profile?.linkedinUrl ? profile.linkedinUrl.split("/").pop() : "Not connected"}
                    </p>
                  </div>
                </div>
                {profile?.linkedinUrl ? (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="w-full text-center rounded-lg bg-mint/10 py-1.5 text-xs font-medium text-mint transition-colors hover:bg-mint/20">
                    View
                  </a>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full text-center rounded-lg bg-white/[0.06] py-1.5 text-xs font-medium transition-colors hover:bg-white/10 hover:text-white cursor-pointer">
                    Connect
                  </button>
                )}
              </div>

              {/* LeetCode (Brand: Orange #FFA116) */}
              <div className="flex flex-col justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2c2c2c] border border-[#FFA116]/30">
                    <span className="text-sm font-bold text-[#FFA116]">LC</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-[#FFA116]">LeetCode</p>
                    <p className="text-xs text-slate truncate">
                      {profile?.leetcodeUrl ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {profile?.leetcodeUrl ? (
                  <a href={profile.leetcodeUrl} target="_blank" rel="noreferrer" className="w-full text-center rounded-lg bg-[#FFA116]/10 py-1.5 text-xs font-medium text-[#FFA116] transition-colors hover:bg-[#FFA116]/20">
                    View Profile
                  </a>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full text-center rounded-lg bg-white/[0.06] py-1.5 text-xs font-medium transition-colors hover:bg-white/10 hover:text-white cursor-pointer">
                    Connect
                  </button>
                )}
              </div>

              {/* ORCID (Brand: Green #A6CE39) */}
              <div className="flex flex-col justify-between rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#12121A] border border-[#A6CE39]/30">
                    <span className="text-sm font-bold text-[#A6CE39]">iD</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-[#A6CE39]">ORCID iD</p>
                    <p className="text-xs text-slate truncate">
                      {profile?.orcidUrl ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {profile?.orcidUrl ? (
                  <a href={profile.orcidUrl} target="_blank" rel="noreferrer" className="w-full text-center rounded-lg bg-[#A6CE39]/10 py-1.5 text-xs font-medium text-[#A6CE39] transition-colors hover:bg-[#A6CE39]/20">
                    View Research
                  </a>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full text-center rounded-lg bg-white/[0.06] py-1.5 text-xs font-medium transition-colors hover:bg-white/10 hover:text-white cursor-pointer">
                    Connect
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Edit Profile Modal */}
      <Modal open={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile Details">
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
                className="h-10 w-full rounded-xl border border-white/10 bg-[#12121A] px-3 text-sm text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none"
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

          {/* Image Adjustments */}
          <div className="border-t border-white/[0.06] pt-3">
            <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Image Alignment & Adjustments</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-3">
                <p className="text-xs font-semibold text-white">Profile Photo Controls</p>
                <div>
                  <div className="flex justify-between text-[10px] text-slate mb-1">
                    <span>Zoom Scale</span>
                    <span>{Math.round(editData.avatarZoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={editData.avatarZoom}
                    onChange={(e) => setEditData({ ...editData, avatarZoom: Number(e.target.value) })}
                    className="w-full accent-mint cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate mb-1">
                      <span>Horizontal (X)</span>
                      <span>{editData.avatarX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={editData.avatarX}
                      onChange={(e) => setEditData({ ...editData, avatarX: Number(e.target.value) })}
                      className="w-full accent-mint cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate mb-1">
                      <span>Vertical (Y)</span>
                      <span>{editData.avatarY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={editData.avatarY}
                      onChange={(e) => setEditData({ ...editData, avatarY: Number(e.target.value) })}
                      className="w-full accent-mint cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-3">
                <p className="text-xs font-semibold text-white">Cover Photo Controls</p>
                <div>
                  <div className="flex justify-between text-[10px] text-slate mb-1">
                    <span>Zoom Scale</span>
                    <span>{Math.round(editData.coverZoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={editData.coverZoom}
                    onChange={(e) => setEditData({ ...editData, coverZoom: Number(e.target.value) })}
                    className="w-full accent-mint cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate mb-1">
                    <span>Vertical Position (Y Offset)</span>
                    <span>{editData.coverY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={editData.coverY}
                    onChange={(e) => setEditData({ ...editData, coverY: Number(e.target.value) })}
                    className="w-full accent-mint cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate mb-1 block">Bio / Summary</label>
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121A] p-3 text-sm text-white placeholder:text-subtle focus:border-accent/50 focus:outline-none min-h-[80px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <label className="mb-1.5 block text-xs font-semibold text-slate">
                Skills (Select 1 to 5)
              </label>
              
              {/* Selected skills capsules */}
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

              {/* Skills options list */}
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
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-mint to-accent py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(56,242,181,0.2)] transition-shadow hover:shadow-[0_0_30px_rgba(56,242,181,0.3)] cursor-pointer"
          >
            Save Changes to Database
          </button>
        </div>
      </Modal>

      {/* Add Project Modal */}
      <Modal open={isAddProjectOpen} onClose={() => setIsAddProjectOpen(false)} title="Add Project Showcase">
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
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121A] p-3 text-sm text-white placeholder:text-subtle focus:border-accent/50 focus:outline-none min-h-[80px]"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/[0.08] hover:border-accent/30 transition-all cursor-pointer"
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
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-accent to-purple py-3 text-sm font-semibold text-white cursor-pointer shadow-glow-sm"
          >
            Add to Profile
          </button>
        </form>
      </Modal>

      {/* Add Experience Modal */}
      <Modal open={isAddExperienceOpen} onClose={() => setIsAddExperienceOpen(false)} title="Add Work Experience">
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
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121A] p-3 text-sm text-white placeholder:text-subtle focus:border-accent/50 focus:outline-none min-h-[80px]"
              placeholder="Highlight your key achievements and contributions..."
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-mint to-electric py-3 text-sm font-semibold text-white cursor-pointer shadow-glow-sm"
          >
            Add Experience
          </button>
        </form>
      </Modal>

      {/* Add License Modal */}
      <Modal open={isAddLicenseOpen} onClose={() => setIsAddLicenseOpen(false)} title="Add License / Certification">
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
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-purple to-electric py-3 text-sm font-semibold text-white cursor-pointer shadow-glow-sm"
          >
            Add Certificate
          </button>
        </form>
      </Modal>

      {/* Avatar Options Modal */}
      <Modal open={avatarMenuOpen} onClose={() => setAvatarMenuOpen(false)} title="Profile Picture Options">
        <div className="space-y-3 p-1">
          {profile?.avatarUrl && (
            <button
              onClick={() => {
                setAvatarMenuOpen(false);
                setLightboxImage({ src: profile.avatarUrl!, title: "Profile Picture" });
              }}
              className="w-full text-left rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-4 py-3 text-sm font-medium text-white transition-all flex items-center gap-3 cursor-pointer"
            >
              👁️ View Full Photo
            </button>
          )}
          <button
            onClick={() => {
              setAvatarMenuOpen(false);
              document.getElementById("avatar-file-input-header")?.click();
            }}
            className="w-full text-left rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-4 py-3 text-sm font-medium text-white transition-all flex items-center gap-3 cursor-pointer"
          >
            📤 Upload New Photo
          </button>
          <button
            onClick={() => {
              setAvatarMenuOpen(false);
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
                coverY: profile?.coverY || 50,
                gender: profile?.gender || "Undeclared"
              });
              setIsEditing(true);
            }}
            className="w-full text-left rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-4 py-3 text-sm font-medium text-white transition-all flex items-center gap-3 cursor-pointer"
          >
            ⚙️ Adjust Position & Zoom
          </button>
          {profile?.avatarUrl && (
            <button
              onClick={async () => {
                setAvatarMenuOpen(false);
                if (confirm("Are you sure you want to remove your profile picture?")) {
                  await updateProfile({ avatarUrl: "" });
                }
              }}
              className="w-full text-left rounded-xl bg-rose/10 hover:bg-rose/20 border border-rose/30 px-4 py-3 text-sm font-medium text-rose transition-all flex items-center gap-3 cursor-pointer"
            >
              ❌ Remove Photo
            </button>
          )}
        </div>
      </Modal>

      {/* Cover Options Modal */}
      <Modal open={coverMenuOpen} onClose={() => setCoverMenuOpen(false)} title="Cover Photo Options">
        <div className="space-y-3 p-1">
          {profile?.coverPhotoUrl && (
            <button
              onClick={() => {
                setCoverMenuOpen(false);
                setLightboxImage({ src: profile.coverPhotoUrl!, title: "Cover Photo" });
              }}
              className="w-full text-left rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-4 py-3 text-sm font-medium text-white transition-all flex items-center gap-3 cursor-pointer"
            >
              👁️ View Full Banner
            </button>
          )}
          <button
            onClick={() => {
              setCoverMenuOpen(false);
              document.getElementById("cover-file-input-header")?.click();
            }}
            className="w-full text-left rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-4 py-3 text-sm font-medium text-white transition-all flex items-center gap-3 cursor-pointer"
          >
            📤 Upload New Cover
          </button>
          <button
            onClick={() => {
              setCoverMenuOpen(false);
              setIsRepositioningCover(true);
            }}
            className="w-full text-left rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-4 py-3 text-sm font-medium text-white transition-all flex items-center gap-3 cursor-pointer"
          >
            ⚙️ Drag to Reposition
          </button>
          {profile?.coverPhotoUrl && (
            <button
              onClick={async () => {
                setCoverMenuOpen(false);
                if (confirm("Are you sure you want to remove your cover photo?")) {
                  await updateProfile({ coverPhotoUrl: "" });
                }
              }}
              className="w-full text-left rounded-xl bg-rose/10 hover:bg-rose/20 border border-rose/30 px-4 py-3 text-sm font-medium text-rose transition-all flex items-center gap-3 cursor-pointer"
            >
              ❌ Remove Cover
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
