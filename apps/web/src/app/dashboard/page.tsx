"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Calendar, Award, Star, Target,
  Bell, Flame, Trophy
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { cn } from "@/lib/utils/cn";

const xpData = { current: 2840, nextLevel: 3500, level: 12 };

const badges = [
  { name: "Hackathon Hero", icon: "🏆", earned: true },
  { name: "Event Explorer", icon: "🎯", earned: true },
  { name: "Social Butterfly", icon: "🦋", earned: true },
  { name: "Code Warrior", icon: "⚔️", earned: true },
  { name: "Mentor", icon: "🧑‍🏫", earned: false },
  { name: "Top Seller", icon: "💰", earned: false },
];



const timeline = [
  { date: "May 10", title: "Won Campus Hackathon", type: "achievement", xp: 500 },
  { date: "May 8", title: "Attended AI Workshop", type: "event", xp: 100 },
  { date: "May 5", title: "Sold Arduino Kit on Marketplace", type: "marketplace", xp: 50 },
  { date: "May 3", title: "Joined Robotics Club", type: "social", xp: 75 },
  { date: "Apr 28", title: "Completed 10-Day Streak", type: "streak", xp: 200 },
];

const leaderboard = [
  { rank: 1, name: "Arjun Mehta", xp: 5240, dept: "CSE" },
  { rank: 2, name: "Priya Sharma", xp: 4890, dept: "ECE" },
  { rank: 3, name: "Rahul Kumar", xp: 4560, dept: "IT" },
  { rank: 4, name: "Sneha Patel", xp: 4120, dept: "CSE" },
  { rank: 5, name: "Vikram Singh", xp: 3980, dept: "ME" },
];

const notifications = [
  { text: "Campus Hackathon starts in 2 days", type: "event", time: "2h ago" },
  { text: "Your listing 'Arduino Kit' got a new offer", type: "marketplace", time: "4h ago" },
  { text: "Dr. Sharma recommended you for ML Internship", type: "recruiter", time: "1d ago" },
  { text: "Team invite from CodeCrafters", type: "team", time: "1d ago" },
];

type Question = {
  question: string;
  options: string[];
  correct: number;
};

const generate100Questions = (subject: string): Question[] => {
  const topics: Record<string, string[]> = {
    React: [
      "hooks like useEffect", "Virtual DOM diffing", "State management with context",
      "performance using useMemo", "re-rendering cycles", "uncontrolled components",
      "custom hooks design", "higher order components", "error boundaries",
      "suspense and concurrent features", "server components rendering", "synthetic events",
      "strict mode checks", "hydration in SSR", "state batching updates"
    ],
    TypeScript: [
      "strict null checks", "interface declaration merging", "mapped types construction",
      "conditional type assertions", "discriminated unions", "generics parameter constraints",
      "utility types like Omit", "type guards narrowing", "readonly modifier limits",
      "namespaces vs modules", "ambient declarations", "decorator execution phases",
      "type compatibility rules", "satisfies operator usage", "const assertions behavior"
    ],
    C: [
      "pointer references manipulation", "virtual destructors cleanup", "smart pointers RAII",
      "templates metaprogramming", "multiple inheritance overrides", "move semantics rvalue",
      "friend function boundaries", "standard template library vectors", "const correctness limits",
      "inline functions optimization", "memory leak detection", "operator overloading constraints",
      "exceptions safety guarantees", "virtual method tables VMT", "destructor execution sequence"
    ],
    "C++": [
      "pointer references manipulation", "virtual destructors cleanup", "smart pointers RAII",
      "templates metaprogramming", "multiple inheritance overrides", "move semantics rvalue",
      "friend function boundaries", "standard template library vectors", "const correctness limits",
      "inline functions optimization", "memory leak detection", "operator overloading constraints",
      "exceptions safety guarantees", "virtual method tables VMT", "destructor execution sequence"
    ],
    Firebase: [
      "Firestore document collections queries", "Realtime Database socket syncs", "Security rules authentication",
      "Cloud Storage upload streams", "Firebase Hosting deployments", "Cloud Functions triggers",
      "Offline cache synchronization", "Analytics event tracking", "App Distribution test flights",
      "Dynamic Links routing", "Remote Config variables caching", "Performance Monitoring traces",
      "Authentication JWT tokens", "Crashlytics logs analysis", "Cloud Messaging push updates"
    ],
    Python: [
      "list comprehensions syntax", "tuple immutability constraints", "GIL multithreading blocks",
      "decorator function execution", "generators yield sequences", "lambda functions limitations",
      "context managers with-blocks", "dunder methods overloading", "exception handling exceptions",
      "virtual environments management", "asyncio concurrent tasks", "metaclasses construction",
      "garbage collection reference counts", "shallow vs deep copy actions", "module import caching"
    ],
    General: [
      "Time complexity binary search", "SOLID design principles architecture", "Git branch merge rebases",
      "REST API status codes specs", "HTTP protocol connection parameters", "SQL database index structures",
      "Docker container network bridges", "Kubernetes pod replica sets", "CI/CD pipeline test stages",
      "Agile scrum sprint plannings", "Cryptography public key pairs", "Regular expressions patterns matching",
      "Model-View-Controller MVC patterns", "DNS lookup resolution routing", "Design patterns Singleton implementations"
    ]
  };

  const topicList = (topics[subject] || topics.General) as string[];
  const questions: Question[] = [];

  for (let i = 1; i <= 100; i++) {
    const concept = topicList[(i - 1) % topicList.length] || "software architecture";
    const questionText = `[Question ${i} of 100] Which of the following describes the most recommended standard implementation pattern for handling ${concept} efficiently inside a production-grade stack?`;
    
    const correctOptionIdx = (i * 7) % 4;
    const options = ["", "", "", ""];
    
    options[correctOptionIdx] = `Deploy a highly optimized strategy specifically designed to correctly manage, align, and scale the execution of ${concept}.`;
    
    for (let j = 0; j < 4; j++) {
      if (j !== correctOptionIdx) {
        const decoyTopics = ["legacy caching structures", "deprecated structural bindings", "unoptimized thread synchronizations"];
        const decoy = decoyTopics[(i + j) % decoyTopics.length];
        options[j] = `Utilize standard legacy workarounds or standard ${decoy} that are generally not optimal for managing ${concept}.`;
      }
    }

    questions.push({
      question: questionText,
      options,
      correct: correctOptionIdx
    });
  }

  return questions;
};

const getRandom20Questions = (subject: string): Question[] => {
  const allQuestions = generate100Questions(subject);
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    const itemJ = shuffled[j];
    if (temp && itemJ) {
      shuffled[i] = itemJ;
      shuffled[j] = temp;
    }
  }
  return shuffled.slice(0, 20);
};

const stagger = {
  container: { transition: { staggerChildren: 0.06 } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }
};

export default function DashboardPage() {
  const { profile, updateProfile } = useAuthStore();

  // MCQ Skill Assessment States
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [showSyncMenu, setShowSyncMenu] = useState(false);

  const generateICSFile = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CAMPUS-BANDHU//Events Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      
      "BEGIN:VEVENT",
      "UID:hackathon-win-2026@campusbandhu.com",
      "DTSTAMP:20260529T000000Z",
      "DTSTART:20260610T090000",
      "DTEND:20260610T180000",
      "SUMMARY:CAMPUS-BANDHU Hackathon Showcase & Ceremony",
      "DESCRIPTION:Annual Campus Hackathon finals, presentation showcase, and winner award ceremony.",
      "LOCATION:Campus Auditorium Main Hall",
      "END:VEVENT",

      "BEGIN:VEVENT",
      "UID:ai-workshop-2026@campusbandhu.com",
      "DTSTAMP:20260529T000000Z",
      "DTSTART:20260612T140000",
      "DTEND:20260612T163000",
      "SUMMARY:Advanced AI & LLM Hands-on Workshop",
      "DESCRIPTION:Hands-on builder laboratory and deep-dive workshop focusing on LLMs, agentic workflows, and web app integrations.",
      "LOCATION:Computer Lab 4, Block B",
      "END:VEVENT",

      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "campus-bandhu-events.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartAssessment = (skillName: string) => {
    setActiveSkill(skillName);
    const questions20 = getRandom20Questions(skillName);
    setActiveQuestions(questions20);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setCorrectAnswers(0);
    setAssessmentCompleted(false);
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNextQuestion = async (questionsCount: number, correctAnswerIdx: number) => {
    const isCorrect = selectedOption === correctAnswerIdx;
    let newCorrectAnswersCount = correctAnswers;
    if (isCorrect) {
      newCorrectAnswersCount += 1;
      setCorrectAnswers(newCorrectAnswersCount);
    }

    if (currentQuestionIdx + 1 < questionsCount) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      const finalScorePercent = Math.round((newCorrectAnswersCount / questionsCount) * 100);
      setAssessmentCompleted(true);

      // Save to Mongoose DB
      const currentSkillLevels = profile?.skillLevels || {};
      await updateProfile({
        skillLevels: {
          ...currentSkillLevels,
          [activeSkill!]: finalScorePercent
        }
      });
    }
  };

  const userSkills = profile?.skills && profile.skills.length > 0
    ? profile.skills.map((skillName, idx) => {
        const level = profile.skillLevels?.[skillName] !== undefined
          ? profile.skillLevels[skillName]
          : 0; // default to 0% if not assessed!
        const colors = ["bg-accent", "bg-mint", "bg-purple", "bg-blaze", "bg-cyan"];
        const color = colors[idx % colors.length] || "bg-accent";
        return { name: skillName, level, color };
      })
    : [
        { name: "React", level: profile?.skillLevels?.["React"] !== undefined ? profile.skillLevels["React"] : 0, color: "bg-accent" },
        { name: "Python", level: profile?.skillLevels?.["Python"] !== undefined ? profile.skillLevels["Python"] : 0, color: "bg-mint" },
        { name: "Machine Learning", level: profile?.skillLevels?.["Machine Learning"] !== undefined ? profile.skillLevels["Machine Learning"] : 0, color: "bg-purple" },
        { name: "Node.js", level: profile?.skillLevels?.["Node.js"] !== undefined ? profile.skillLevels["Node.js"] : 0, color: "bg-blaze" },
        { name: "Blockchain", level: profile?.skillLevels?.["Blockchain"] !== undefined ? profile.skillLevels["Blockchain"] : 0, color: "bg-cyan" },
      ];

  return (
    <AppShell>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        {/* ── Welcome + Stats ──────────────────────── */}
        <motion.div variants={stagger.item} className="grid gap-4 md:grid-cols-4">
          {/* Welcome Card */}
          <GlassCard className="md:col-span-2 relative overflow-hidden" glow="blue">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-[60px]" />
            <div className="relative flex items-center gap-4">
              <Avatar
                src={null}
                name={profile?.fullName || "Student"}
                size="xl"
                status="online"
                glow
              />
              <div>
                <p className="text-sm text-slate">Welcome back</p>
                <h2 className="font-heading text-2xl font-bold">{profile?.fullName || "Student"}</h2>
                <div className="mt-2 flex gap-2">
                  <NeonBadge color="blue" size="sm">Level {xpData.level}</NeonBadge>
                  <NeonBadge color="mint" size="sm" pulse>
                    <Flame className="h-3 w-3" /> 7-day streak
                  </NeonBadge>
                </div>
              </div>
            </div>
            {/* XP Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate">XP Progress</span>
                <span className="font-semibold text-accent">
                  <AnimatedCounter value={xpData.current} /> / {xpData.nextLevel}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(xpData.current / xpData.nextLevel) * 100}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-accent to-electric shadow-[0_0_10px_rgba(0,212,255,0.4)]"
                />
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats: Events Attended Card with Google & Apple Calendar Sync */}
          <motion.div variants={stagger.item}>
            <GlassCard className="h-full relative overflow-visible" glow="blue">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 shadow-[0_0_12px_rgba(0,212,255,0.1)]">
                    <Calendar className="h-5 w-5 text-accent animate-pulse" />
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-bold text-accent">
                      <AnimatedCounter value={24} />
                    </p>
                    <p className="text-xs text-slate">Events Attended</p>
                  </div>
                </div>

                {/* Calendar Sync Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSyncMenu(prev => !prev)}
                    className="text-[9px] font-bold px-2 py-1 rounded bg-white/[0.04] border border-white/10 hover:bg-accent/15 hover:border-accent/30 hover:text-accent transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider text-slate"
                  >
                    <span>Sync</span>
                    <span className="text-[7px] opacity-60">▼</span>
                  </button>

                  {showSyncMenu && (
                    <>
                      {/* Click outside overlay to close */}
                      <div className="fixed inset-0 z-10" onClick={() => setShowSyncMenu(false)} />
                      <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-white/[0.08] bg-black/90 backdrop-blur-xl p-1 shadow-2xl z-20 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <a
                          href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=CAMPUS-BANDHU+Hackathon+%26+Events+Schedule&details=Sync+your+academic+events,+hackathons,+and+recruitment+activities+instantly.&sf=true&output=xml"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowSyncMenu(false)}
                          className="w-full text-left rounded-lg p-2 text-[9px] font-bold uppercase tracking-wider text-slate hover:bg-white/[0.04] hover:text-white flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <span className="text-xs">📅</span> Google Calendar
                        </a>
                        <button
                          onClick={() => {
                            generateICSFile();
                            setShowSyncMenu(false);
                          }}
                          className="w-full text-left rounded-lg p-2 text-[9px] font-bold uppercase tracking-wider text-slate hover:bg-white/[0.04] hover:text-white flex items-center gap-2 cursor-pointer transition-all border-t border-white/[0.04]"
                        >
                          <span className="text-xs">🍎</span> Apple Calendar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Stats: Achievements Card */}
          <motion.div variants={stagger.item}>
            <GlassCard className="h-full" glow="mint">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint/10 border border-mint/20 shadow-[0_0_12px_rgba(56,242,181,0.1)]">
                  <Award className="h-5 w-5 text-mint" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-mint">
                    <AnimatedCounter value={18} />
                  </p>
                  <p className="text-xs text-slate">Achievements</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* ── Main Grid ───────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Tracker */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" /> Skill Tracker
                  </h3>
                  <NeonBadge color="cyan" size="sm">AI Assessed</NeonBadge>
                </div>
                <div className="space-y-3">
                  {userSkills.map((skill) => {
                    const isVerified = profile?.skillLevels?.[skill.name] !== undefined;
                    return (
                      <div 
                        key={skill.name}
                        className={cn(
                          "transition-opacity duration-300",
                          !isVerified && "opacity-70 hover:opacity-100"
                        )}
                      >
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{skill.name}</span>
                            <NeonBadge 
                              color={isVerified ? "mint" : "rose"} 
                              size="sm" 
                              pulse={!isVerified}
                              className="scale-90 origin-left"
                            >
                              {isVerified ? "Verified" : "Estimated"}
                            </NeonBadge>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "font-medium transition-colors",
                              isVerified ? "text-mint font-bold" : "text-slate"
                            )}>
                              {skill.level}%
                            </span>
                            <button
                              onClick={() => handleStartAssessment(skill.name)}
                              className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer uppercase tracking-wider",
                                isVerified 
                                  ? "bg-white/[0.04] border border-white/10 hover:bg-accent/15 hover:border-accent/30 hover:text-accent text-slate" 
                                  : "bg-rose/10 border border-rose/30 hover:bg-rose/25 hover:border-rose/50 text-rose animate-pulse"
                              )}
                            >
                              {isVerified ? "Re-Test" : "Test Now"}
                            </button>
                          </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06] mb-3 relative">
                          {isVerified ? (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                              className={`h-full rounded-full bg-gradient-to-r from-accent to-electric shadow-[0_0_10px_rgba(0,212,255,0.4)]`}
                            />
                          ) : (
                            // Pulsing scanner sweep animation running across the empty progress track
                            <motion.div
                              animate={{ 
                                x: ["-100%", "100%"] 
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "linear" 
                              }}
                              className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-rose/30 to-transparent"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>

            {/* Achievement Timeline */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-mint" /> Achievement Timeline
                </h3>
                <div className="relative ml-3 space-y-4 border-l border-white/10 pl-6">
                  {timeline.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="relative"
                    >
                      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-accent bg-base" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-slate">{item.date}</p>
                        </div>
                        <NeonBadge color="mint" size="sm">+{item.xp} XP</NeonBadge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Badges */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-blaze" /> Badges
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.name}
                      className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                        badge.earned
                          ? "bg-white/[0.04] hover:bg-white/[0.08]"
                          : "opacity-30"
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="mt-1 text-[10px] text-slate">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Leaderboard */}
            <motion.div variants={stagger.item}>
              <GlassCard glow="purple">
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple" /> Campus Leaderboard
                </h3>
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                        entry.rank <= 3 ? "bg-white/[0.04]" : ""
                      }`}
                    >
                      <span className={`w-6 text-center font-heading text-sm font-bold ${
                        entry.rank === 1 ? "text-blaze" : entry.rank === 2 ? "text-slate" : entry.rank === 3 ? "text-amber-600" : "text-subtle"
                      }`}>
                        {entry.rank}
                      </span>
                      <Avatar name={entry.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{entry.name}</p>
                        <p className="text-[10px] text-slate">{entry.dept}</p>
                      </div>
                      <span className="text-xs font-semibold text-purple">
                        <AnimatedCounter value={entry.xp} /> XP
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Notifications */}
            <motion.div variants={stagger.item}>
              <GlassCard>
                <h3 className="mb-4 font-heading text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-cyan" /> Notifications
                </h3>
                <div className="space-y-2">
                  {notifications.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3">
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                        n.type === "event" ? "bg-accent" :
                        n.type === "marketplace" ? "bg-blaze" :
                        n.type === "recruiter" ? "bg-purple" : "bg-mint"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{n.text}</p>
                        <p className="text-[10px] text-slate">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Skill Assessment MCQ Modal */}
      <Modal
        open={!!activeSkill}
        onClose={() => {
          setActiveSkill(null);
          setAssessmentCompleted(false);
          setCurrentQuestionIdx(0);
          setSelectedOption(null);
        }}
        title={`${activeSkill} Skill Assessment`}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {activeSkill && (() => {
            const questions = activeQuestions;
            const currentQuestion = questions[currentQuestionIdx];
            
            if (assessmentCompleted) {
              const scorePercent = Math.round((correctAnswers / questions.length) * 100);
              return (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-mint/10 border-2 border-mint flex items-center justify-center text-4xl animate-bounce shadow-glow-sm">
                    🎓
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-semibold text-white animate-pulse">Assessment Complete!</h4>
                    <p className="text-xs text-slate mt-1">Your level in {activeSkill} has been successfully verified.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] max-w-xs mx-auto">
                    <span className="text-[10px] text-slate uppercase tracking-wider block font-bold">Your Verified Level</span>
                    <span className="text-3xl font-heading font-black text-mint">{scorePercent}%</span>
                    <span className="text-xs text-slate block mt-1.5 font-medium">({correctAnswers} of {questions.length} correct)</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveSkill(null);
                      setAssessmentCompleted(false);
                      setCurrentQuestionIdx(0);
                      setSelectedOption(null);
                    }}
                    className="rounded-xl bg-mint hover:bg-mint/80 px-6 py-2.5 text-xs font-bold text-base transition-colors shadow-lg shadow-mint/15 cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              );
            }

            if (!currentQuestion) return null;

            return (
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate uppercase font-semibold">
                    <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                    <span>Progress: {Math.round(((currentQuestionIdx) / questions.length) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.04] border border-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,212,255,0.3)]" style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }} />
                  </div>
                </div>

                {/* Question Card */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
                  <h4 className="text-sm font-semibold text-white leading-relaxed">{currentQuestion.question}</h4>
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={cn(
                        "w-full text-left rounded-xl border p-3.5 text-xs font-medium transition-all flex items-center justify-between group cursor-pointer",
                        selectedOption === idx
                          ? "border-accent bg-accent/10 text-white shadow-glow-sm"
                          : "border-white/[0.06] bg-white/[0.01] text-slate hover:bg-white/[0.02] hover:border-white/10"
                      )}
                    >
                      <span>{option}</span>
                      <div className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ml-3",
                        selectedOption === idx
                          ? "border-accent bg-accent text-base"
                          : "border-white/20 bg-transparent group-hover:border-white/40"
                      )}>
                        {selectedOption === idx && <span className="w-1.5 h-1.5 rounded-full bg-base" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Next button */}
                <div className="flex justify-end pt-2 border-t border-white/[0.04]">
                  <button
                    disabled={selectedOption === null}
                    onClick={() => handleNextQuestion(questions.length, currentQuestion.correct)}
                    className={cn(
                      "rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-md",
                      selectedOption === null
                        ? "bg-white/[0.04] text-slate/40 cursor-not-allowed border border-white/[0.04]"
                        : "bg-accent hover:brightness-110 text-base cursor-pointer shadow-accent/10"
                    )}
                  >
                    {currentQuestionIdx + 1 === questions.length ? "Submit Answers" : "Next Question"}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </Modal>
    </AppShell>
  );
}
