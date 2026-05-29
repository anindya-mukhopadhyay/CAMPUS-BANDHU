"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Flame,
  ArrowRight, Sparkles, BookOpen, Code, Palette, Mic, Plus, Users, MessageSquare, Send, X, ShieldAlert
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { teamService } from "@/services";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const trendingTopics = [
  { tag: "hackathon", posts: 342, trend: "+28%" },
  { tag: "ai-ml", posts: 289, trend: "+45%" },
  { tag: "placement", posts: 198, trend: "+12%" },
  { tag: "web3", posts: 156, trend: "+67%" },
  { tag: "cultural-fest", posts: 134, trend: "+19%" },
];

const categories = [
  { name: "Technical", icon: Code, color: "text-accent", count: 45 },
  { name: "Cultural", icon: Palette, color: "text-purple", count: 23 },
  { name: "Academic", icon: BookOpen, color: "text-mint", count: 38 },
  { name: "Music & Arts", icon: Mic, color: "text-blaze", count: 16 },
];

const upcomingEvents = [
  { title: "Campus Hackathon 2024", date: "May 18", attendees: 248, category: "Hackathon" },
  { title: "AI Workshop", date: "May 15", attendees: 45, category: "Workshop" },
  { title: "Startup Pitch Night", date: "May 20", attendees: 80, category: "Career" },
  { title: "Cultural Night", date: "May 22", attendees: 500, category: "Cultural" },
];

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

export default function DiscoverPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user, profile } = useAuthStore();
  const [newTeam, setNewTeam] = useState({
    teamName: "",
    event: "",
    skills: "",
    roles: "",
    boysCriteria: 1,
    girlsCriteria: 1
  });

  // Interactive Hover Skills Overlap state
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);

  // Chat Drawer states
  const [activeChatTeam, setActiveChatTeam] = useState<any | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await teamService.getAll();
      setTeams(res.data || []);
    } catch (err) {
      console.error("Failed to load teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.teamName || !newTeam.event) {
      alert("Team Name and Target Event are required!");
      return;
    }

    try {
      const payload = {
        name: newTeam.teamName,
        event: newTeam.event,
        skills: newTeam.skills.split(",").map(s => s.trim()).filter(Boolean),
        need: newTeam.roles.split(",").map(r => r.trim()).filter(Boolean),
        boysCriteria: Number(newTeam.boysCriteria) || 0,
        girlsCriteria: Number(newTeam.girlsCriteria) || 0
      };

      await teamService.create(payload);
      setIsCreateModalOpen(false);
      
      // Reset Form
      setNewTeam({
        teamName: "",
        event: "",
        skills: "",
        roles: "",
        boysCriteria: 1,
        girlsCriteria: 1
      });

      await fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create team.");
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    try {
      await teamService.joinRequest(teamId);
      alert("Request to join team sent! Waiting for Team Lead approval.");
      await fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to send join request.");
    }
  };

  const handleAcceptRequest = async (teamId: string, requesterId: string) => {
    try {
      await teamService.acceptRequest(teamId, requesterId);
      await fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to accept join request.");
    }
  };

  const handleRejectRequest = async (teamId: string, requesterId: string) => {
    try {
      await teamService.rejectRequest(teamId, requesterId);
      await fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to reject join request.");
    }
  };

  // Chat Drawer Actions
  const handleOpenChat = (team: any) => {
    setActiveChatTeam(team);
    setIsChatOpen(true);
    setChatMessages([
      {
        sender: "lead",
        text: `Hey! Thanks for reaching out about our team, ${team.name}. We are forming a group for ${team.event}. What's your background in our required skills (${team.skills.join(", ")})?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatTeam) return;

    const userMsg = {
      sender: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Simulated Smart Creator Reply
    setTimeout(() => {
      setIsTyping(false);
      const reply = {
        sender: "lead",
        text: `That sounds really impressive! You definitely have the right credentials we are looking for. Have you clicked the "Join Team" button to submit your official request? Once you do, I can approve you immediately!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, reply]);
    }, 1500);
  };

  return (
    <AppShell>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={stagger.item}>
          <h1 className="font-heading text-3xl font-bold">Discover</h1>
          <p className="mt-1 text-sm text-slate">Explore what&apos;s happening across campus — events, trends, and AI team matches</p>
        </motion.div>

        {/* AI Team Matching */}
        <motion.div variants={stagger.item}>
          <GlassCard className="relative overflow-hidden" glow="purple">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple/10 blur-[60px]" />
            <div className="relative">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple animate-pulse" />
                  <h2 className="font-heading text-lg font-semibold">AI Team Matching</h2>
                  <NeonBadge color="purple" size="sm" pulse>Smart Match</NeonBadge>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple to-accent px-4 py-2 text-xs font-semibold text-white shadow-neon hover:shadow-glow-md transition-shadow cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create Team
                </button>
              </div>
              <p className="text-sm text-slate mb-4">Teams looking for members like you — matched by skills, interests, and availability.</p>
              
              {loading && (
                <p className="text-sm text-slate italic text-center py-6">Syncing live teams list...</p>
              )}

              {!loading && teams.length === 0 && (
                <p className="text-sm text-slate italic text-center py-6">No teams formed yet. Be the first to form a team!</p>
              )}

              {/* Horizontal Scrollable Teams Container */}
              {!loading && teams.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {teams.map((team) => {
                    const isCreator = team.creatorId === user?.uid;
                    const isMember = team.members.includes(user?.uid || "");
                    const isPending = team.pendingRequests.includes(user?.uid || "");

                    // Intersect skills to compute dynamic matching compatibility overlap!
                    const userSkills = profile?.skills || [];
                    const matchedSkills = team.skills.filter((s: string) => 
                      userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase())
                    );
                    const isHovered = hoveredTeamId === team.id;

                    return (
                      <div 
                        key={team.id} 
                        onMouseEnter={() => setHoveredTeamId(team.id)}
                        onMouseLeave={() => setHoveredTeamId(null)}
                        className="min-w-[300px] sm:min-w-[340px] max-w-[340px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] hover:border-purple/30 snap-align-start shrink-0 flex flex-col justify-between relative group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm text-white">{team.name}</h3>
                            <span className="font-heading text-lg font-bold text-mint">{team.matchScore}%</span>
                          </div>
                          <p className="text-xs text-slate mb-2 font-medium">{team.event} <span className="text-[10px] text-subtle">· by {team.creatorName}</span></p>
                          
                          {/* Boys/Girls Criteria */}
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-slate bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.04] flex items-center gap-1.5">
                              Criteria: 
                              {team.boysCriteria > 0 && <span className="text-electric">{team.boysCriteria} ♂️</span>}
                              {team.boysCriteria > 0 && team.girlsCriteria > 0 && <span>·</span>}
                              {team.girlsCriteria > 0 && <span className="text-rose">{team.girlsCriteria} ♀️</span>}
                              {team.boysCriteria === 0 && team.girlsCriteria === 0 && <span className="text-subtle">Any</span>}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {team.skills.map((s: string) => {
                              const isMatched = matchedSkills.includes(s);
                              return (
                                <span 
                                  key={s} 
                                  className={`rounded-md px-2 py-0.5 text-[9px] border transition-all ${
                                    isMatched 
                                      ? "bg-mint/10 border-mint/30 text-mint shadow-glow-sm" 
                                      : "bg-purple/10 border-purple/20 text-purple"
                                  }`}
                                >
                                  {s}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Skills Overlap & Compatibility Radar (Hover state) */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mb-3 overflow-hidden border-t border-white/[0.06] pt-3"
                            >
                              <p className="text-[10px] font-semibold text-slate uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-purple animate-spin" /> Skill Compatibility Radar
                              </p>
                              <div className="flex items-center justify-around bg-black/20 p-2 rounded-lg border border-white/[0.04]">
                                <div className="text-center relative flex items-center justify-center">
                                  {/* Left Circle: You */}
                                  <div className="w-10 h-10 rounded-full border border-mint/40 bg-mint/5 flex items-center justify-center text-[8px] text-mint font-bold shadow-glow-sm">
                                    You
                                  </div>
                                </div>
                                
                                {/* Pulsating Intersecting Rings */}
                                <div className="relative flex h-8 w-12 items-center justify-center">
                                  <span className="absolute inline-flex h-6 w-6 rounded-full bg-purple/10 opacity-75 animate-ping" />
                                  <span className="absolute inline-flex h-4 w-4 rounded-full bg-mint/10 opacity-75 animate-ping" />
                                  <span className="text-[9px] font-bold text-white z-10">{matchedSkills.length} Core</span>
                                </div>

                                <div className="text-center relative flex items-center justify-center">
                                  {/* Right Circle: Team */}
                                  <div className="w-10 h-10 rounded-full border border-purple/40 bg-purple/5 flex items-center justify-center text-[8px] text-purple font-bold">
                                    Team
                                  </div>
                                </div>
                              </div>
                              <p className="text-[9px] text-center text-slate mt-1.5 font-medium">
                                {matchedSkills.length > 0 
                                  ? `You match ${matchedSkills.length} required skill${matchedSkills.length > 1 ? "s" : ""}!` 
                                  : "Expand your portfolio to match their skills!"}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div>
                          <div className="flex flex-col gap-1 text-[10px] text-slate mb-3 border-t border-white/[0.04] pt-2">
                            <div className="flex justify-between">
                              <span>Current members:</span>
                              <span className="font-semibold text-white">{team.members.length} members</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Members needed:</span>
                              <span className="font-semibold text-accent">{team.membersNeeded} open slots</span>
                            </div>
                            {team.need.length > 0 && (
                              <div className="flex justify-between">
                                <span>Looking for:</span>
                                <span className="text-accent font-semibold">{team.need.join(", ")}</span>
                              </div>
                            )}
                          </div>

                          {/* Member Request flow buttons */}
                          <div className="flex gap-2">
                            {isCreator ? (
                              <div className="flex-1 text-center py-1.5 bg-purple/10 border border-purple/20 rounded-lg text-purple font-semibold text-xs">
                                Team Admin
                              </div>
                            ) : isMember ? (
                              <div className="flex-1 text-center py-1.5 bg-mint/10 border border-mint/20 rounded-lg text-mint font-semibold text-xs">
                                Joined Member
                              </div>
                            ) : isPending ? (
                              <button disabled className="flex-1 rounded-lg bg-white/[0.06] border border-white/[0.1] py-1.5 text-xs font-semibold text-slate cursor-not-allowed">
                                Request Pending
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleJoinRequest(team.id)}
                                className="flex-1 rounded-lg bg-accent/10 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20 cursor-pointer"
                              >
                                Join Team
                              </button>
                            )}
                            
                            {/* Message creator drawer trigger */}
                            {!isCreator && (
                              <button 
                                onClick={() => handleOpenChat(team)}
                                className="px-2.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer text-slate flex items-center justify-center"
                                title="Message Team Lead"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Creator Pending Requests Management */}
                          {isCreator && team.pendingRequestsPopulated && team.pendingRequestsPopulated.length > 0 && (
                            <div className="mt-3 border-t border-white/[0.06] pt-2">
                              <p className="text-[10px] font-semibold text-white mb-2 flex items-center gap-1">
                                <Users className="h-3 w-3 text-purple" /> Join Requests ({team.pendingRequestsPopulated.length})
                              </p>
                              <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                                {team.pendingRequestsPopulated.map((req: any) => (
                                  <div key={req.uid} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-lg">
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-medium text-white truncate">{req.fullName}</p>
                                      <p className="text-[8px] text-slate">{req.gender || "Undeclared"}</p>
                                    </div>
                                    <div className="flex gap-1">
                                      <button 
                                        onClick={() => handleAcceptRequest(team.id, req.uid)}
                                        className="px-2 py-0.5 rounded bg-mint/10 hover:bg-mint/20 text-mint text-[9px] font-bold cursor-pointer"
                                      >
                                        Accept
                                      </button>
                                      <button 
                                        onClick={() => handleRejectRequest(team.id, req.uid)}
                                        className="px-2 py-0.5 rounded bg-rose/10 hover:bg-rose/20 text-rose text-[9px] font-bold cursor-pointer"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Categories */}
            <motion.div variants={stagger.item} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((cat) => (
                <GlassCard key={cat.name} hover padding="sm" className="text-center cursor-pointer">
                  <cat.icon className={`mx-auto h-6 w-6 ${cat.color}`} />
                  <p className="mt-2 text-sm font-semibold">{cat.name}</p>
                  <p className="text-xs text-slate">{cat.count} active</p>
                </GlassCard>
              ))}
            </motion.div>

            {/* Upcoming */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" /> Upcoming Events
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-slate">{event.date} · {event.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate"><AnimatedCounter value={event.attendees} /> going</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-base font-semibold flex items-center gap-2 text-white">
                  <Flame className="h-4 w-4 text-blaze" /> Trending Topics
                </h3>
                <div className="space-y-2">
                  {trendingTopics.map((topic, i) => (
                    <div key={topic.tag} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-subtle font-medium">#{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">#{topic.tag}</p>
                          <p className="text-[10px] text-slate">{topic.posts} posts</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-mint">{topic.trend}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Create Team Modal */}
      <Modal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title="Create New Team"
      >
        <form onSubmit={handleCreateTeamSubmit} className="space-y-4 p-1">
          <Input
            label="Team Name"
            placeholder="e.g. CodeCrafters"
            value={newTeam.teamName}
            onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
            required
          />
          <Input
            label="Target Event / Challenge"
            placeholder="e.g. Campus Hackathon"
            value={newTeam.event}
            onChange={(e) => setNewTeam({ ...newTeam, event: e.target.value })}
            required
          />
          <Input
            label="Skills Needed (comma-separated)"
            placeholder="e.g. React, Node.js, Python"
            value={newTeam.skills}
            onChange={(e) => setNewTeam({ ...newTeam, skills: e.target.value })}
          />
          <Input
            label="Roles Needed (comma-separated)"
            placeholder="e.g. Backend Dev, UI Designer"
            value={newTeam.roles}
            onChange={(e) => setNewTeam({ ...newTeam, roles: e.target.value })}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Boys Needed (Criteria)"
              type="number"
              min="0"
              value={newTeam.boysCriteria}
              onChange={(e) => setNewTeam({ ...newTeam, boysCriteria: Number(e.target.value) || 0 })}
            />
            <Input
              label="Girls Needed (Criteria)"
              type="number"
              min="0"
              value={newTeam.girlsCriteria}
              onChange={(e) => setNewTeam({ ...newTeam, girlsCriteria: Number(e.target.value) || 0 })}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-purple to-accent py-3 text-sm font-semibold text-white shadow-neon hover:brightness-110 transition-all cursor-pointer"
          >
            Form Team
          </button>
        </form>
      </Modal>

      {/* Floating Glassmorphic Team Mini-Chat Drawer */}
      <AnimatePresence>
        {isChatOpen && activeChatTeam && (
          <>
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs cursor-pointer"
            />
            
            {/* Chat drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#0b0b0f]/90 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl z-50 p-6 flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center font-bold text-purple">
                      {activeChatTeam.name[0]}
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-white">{activeChatTeam.name} Lead</h3>
                      <p className="text-[9px] text-mint flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" /> Active now
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Team meta info */}
                <div className="mt-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate font-medium">Looking for matches for <span className="text-white font-semibold">{activeChatTeam.event}</span>.</p>
                    <p className="text-[9px] text-subtle mt-0.5">Required skills: {activeChatTeam.skills.join(", ")}</p>
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 my-4 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {chatMessages.map((msg, idx) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                          isUser 
                            ? "bg-gradient-to-r from-purple to-accent text-white rounded-tr-none shadow-glow-sm" 
                            : "bg-white/[0.04] border border-white/[0.06] text-white rounded-tl-none"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                      <span className="text-[8px] text-slate mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex flex-col items-start">
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-inner">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-10 rounded-xl border border-white/[0.06] bg-[#12121A] px-3.5 text-xs text-white placeholder:text-subtle focus:border-accent/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple to-accent hover:brightness-110 transition-all text-white shadow-neon cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
