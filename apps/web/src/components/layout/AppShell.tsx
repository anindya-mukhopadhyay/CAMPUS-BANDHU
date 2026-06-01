"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import { systemService } from "@/services";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BrainCircuit, Compass, LayoutGrid, Store, UserCircle2, Users,
  Briefcase, Shield, LogOut, Menu, X, ChevronDown, Zap, HelpCircle, Settings, Award
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { type Role, ROLE_LABELS, ROLE_COLORS, useAuthStore } from "@/lib/stores/useAuthStore";
import { logout } from "@/lib/firebase/auth";
import { Avatar } from "@/components/ui/avatar";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";

type NavItem = {
  href: string;
  label: string;
  icon: any;
  allowedRoles?: Role[];
};

const MotionLink = motion(Link);

const getIconVariants = (label: string) => {
  switch (label) {
    case "Command":
      return {
        default: { scale: 1, rotate: 0 },
        hover: { rotate: 90, scale: 1.15, transition: { type: "spring", stiffness: 300, damping: 15 } },
        active: { scale: 1.1, rotate: 0 }
      };
    case "Dashboard":
      return {
        default: { scale: 1, rotate: 0, filter: "none" },
        hover: { 
          scale: 1.2, 
          rotate: [0, -10, 10, -10, 10, 0],
          filter: "drop-shadow(0 0 8px rgba(0,212,255,0.6))",
          transition: { duration: 0.5 } 
        },
        active: { scale: 1.15, filter: "drop-shadow(0 0 5px rgba(0,212,255,0.4))" }
      };
    case "Events":
      return {
        default: { scale: 1, rotate: 0 },
        hover: { 
          rotate: [0, -15, 12, -10, 8, -4, 0],
          scale: 1.2,
          transition: { duration: 0.6 }
        },
        active: { scale: 1.1 }
      };
    case "Discover":
      return {
        default: { scale: 1, rotate: 0 },
        hover: { rotate: 360, scale: 1.2, transition: { duration: 0.8, ease: "linear", repeat: Infinity } },
        active: { scale: 1.15 }
      };
    case "Network":
      return {
        default: { scale: 1, y: 0 },
        hover: { y: -2, scale: 1.2, transition: { type: "spring", stiffness: 400, damping: 10 } },
        active: { scale: 1.1, y: 0 }
      };
    case "Marketplace":
      return {
        default: { scale: 1, y: 0 },
        hover: { y: [0, -4, 0], scale: 1.18, transition: { duration: 0.5 } },
        active: { scale: 1.1 }
      };
    case "AI Copilot":
      return {
        default: { scale: 1, filter: "none" },
        hover: { 
          scale: 1.2,
          filter: "drop-shadow(0 0 8px rgba(0,212,255,0.6))",
          transition: { type: "spring", stiffness: 300, damping: 10 }
        },
        active: { scale: 1.15, filter: "drop-shadow(0 0 5px rgba(0,212,255,0.4))" }
      };
    case "Identity":
      return {
        default: { scale: 1, rotate: 0 },
        hover: { scale: 1.2, rotate: 15, transition: { type: "spring", stiffness: 300, damping: 10 } },
        active: { scale: 1.1, rotate: 0 }
      };
    case "Recruiters":
      return {
        default: { scale: 1, y: 0, rotate: 0 },
        hover: { y: -2, rotate: -5, scale: 1.18, transition: { type: "spring", stiffness: 300, damping: 12 } },
        active: { scale: 1.1, y: 0 }
      };
    case "Faculty Hub":
      return {
        default: { scale: 1, rotate: 0 },
        hover: { scale: 1.2, rotate: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } },
        active: { scale: 1.1, rotate: 0 }
      };
    default:
      return {
        default: { scale: 1 },
        hover: { scale: 1.15 },
        active: { scale: 1.1 }
      };
  }
};

const navItems: NavItem[] = [
  { href: "/", label: "Command", icon: LayoutGrid },
  { href: "/dashboard", label: "Dashboard", icon: Zap },
  { href: "/events", label: "Events", icon: Bell },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/network", label: "Network", icon: Users },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/assistant", label: "AI Copilot", icon: BrainCircuit },
  { href: "/profile", label: "Identity", icon: UserCircle2 },
  { href: "/recruiters", label: "Recruiters", icon: Briefcase, allowedRoles: ["student", "recruiter", "super_admin", "college_admin"] },
  { href: "/admin", label: "Admin Panel", icon: Shield, allowedRoles: ["super_admin", "college_admin"] },
  { href: "/faculty", label: "Faculty Hub", icon: Award, allowedRoles: ["faculty", "super_admin"] }
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pulse, setPulse] = useState({ events: 0, online: 0, recruiters: 0 });

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const res = await systemService.getSystemPulse();
        if (res?.data) {
          setPulse({
            events: res.data.events || 0,
            online: res.data.online || 0,
            recruiters: res.data.recruiters || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch system pulse:", err);
      }
    };

    fetchPulse();
    const interval = setInterval(fetchPulse, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredNav = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!role) return false;
    return item.allowedRoles.includes(role);
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] gap-0 lg:gap-6 lg:px-6 lg:py-6">
      {/* ══════ Desktop Sidebar ══════ */}
      <aside className="hidden w-[280px] shrink-0 lg:block">
        <div className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col overflow-y-auto rounded-3xl glass-strong p-5 shadow-float">
          {/* Brand */}
          <motion.div
            whileHover="hover"
            className="group/brand relative mb-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] p-3 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.08] hover:shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.08)]"
          >
            {/* Dynamic liquid shine sweep */}
            <span className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <span className="absolute inset-0 -translate-x-full group-hover/brand:animate-shine-glide bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </span>

            <div className="flex items-center gap-3">
              <motion.div 
                variants={{
                  hover: { 
                    rotate: [0, -10, 15, -10, 10, 0],
                    scale: 1.1,
                    boxShadow: "0 0 20px rgba(0,212,255,0.6), inset 0 1px 1px rgba(255,255,255,0.4)",
                    transition: { duration: 0.6 }
                  }
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-electric shadow-[0_0_15px_rgba(0,212,255,0.3)] border border-white/20 transition-all duration-300"
              >
                <Zap className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <p className="font-heading text-base font-extrabold tracking-wider text-white transition-all duration-300 group-hover/brand:text-accent group-hover/brand:drop-shadow-[0_0_8px_rgba(0,212,255,0.5)] relative">
                  CAMPUS-BANDHU
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-accent to-purple transition-all duration-500 group-hover/brand:w-full shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                </p>
                <motion.p
                  variants={{
                    hover: { 
                      letterSpacing: "0.25em",
                      color: "rgba(255,255,255,0.95)",
                      transition: { duration: 0.4 }
                    }
                  }}
                  className="text-[10px] uppercase tracking-[0.2em] text-slate/80 font-medium transition-all duration-300"
                >
                  Smart Campus OS
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <MotionLink
                  key={item.href}
                  href={item.href}
                  whileHover="hover"
                  animate={isActive ? "active" : "default"}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "text-white font-semibold"
                      : "text-slate hover:text-white"
                  )}
                >
                  {/* Liquid shine glide animation */}
                  <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <span className="absolute inset-0 -translate-x-full group-hover:animate-shine-glide bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </span>

                  {isActive ? (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/20 to-electric/5 border border-accent/30 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,212,255,0.1)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-white/[0.03] border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] transition-all duration-300" />
                  )}

                  <motion.div
                    className="relative z-10 shrink-0"
                    variants={getIconVariants(item.label)}
                  >
                    <Icon className={cn("h-4 w-4 transition-colors duration-300", isActive ? "text-accent" : "text-slate group-hover:text-white")} />
                  </motion.div>

                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_rgba(0,212,255,0.8)] animate-pulse" />
                  )}
                </MotionLink>
              );
            })}
          </nav>

          {/* System Pulse */}
          <div className="mt-4 rounded-2xl bg-white/[0.03] p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white">System Pulse</p>
              <div className="relative">
                <Bell className="h-4 w-4 text-accent" />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent animate-ping" />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="font-heading text-lg font-bold text-accent"><AnimatedCounter value={pulse.events} /></p>
                <p className="text-[9px] text-slate">Events</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-lg font-bold text-mint"><AnimatedCounter value={pulse.online} /></p>
                <p className="text-[9px] text-slate">Online</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-lg font-bold text-purple"><AnimatedCounter value={pulse.recruiters} /></p>
                <p className="text-[9px] text-slate">Recruiters</p>
              </div>
            </div>
          </div>

          {/* User / Auth Section */}
          <div className="mt-4 rounded-2xl border border-accent/10 bg-accent/[0.03] p-4">
            {!isAuthenticated ? (
              <button
                onClick={() => router.push("/auth")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-electric py-2.5 text-sm font-semibold text-white shadow-glow-sm transition-shadow hover:shadow-neon"
              >
                Sign In
              </button>
            ) : (
              <div className="space-y-3">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user?.photoURL}
                    name={profile?.fullName || "User"}
                    size="md"
                    status="online"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{profile?.fullName || "User"}</p>
                    <NeonBadge color={(ROLE_COLORS[role!] || "blue") as any} size="sm">
                      {ROLE_LABELS[role!] || "Student"}
                    </NeonBadge>
                  </div>
                </div>



                {/* Actions */}
                <div className="flex w-full">
                  <button
                    onClick={async () => {
                      await logout();
                      useAuthStore.setState({
                        user: null,
                        profile: null,
                        role: null,
                        isAuthenticated: false,
                        isLoading: false
                      });
                      router.replace("/auth");
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] py-2 text-xs font-medium text-slate transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ══════ Mobile Header ══════ */}
      <div className="fixed left-0 right-0 top-0 z-40 glass-strong border-b border-white/[0.06] px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <motion.div 
            whileHover="hover" 
            className="flex items-center gap-2.5 cursor-pointer group/mobbrand"
            onClick={() => router.push("/")}
          >
            <motion.div 
              variants={{
                hover: { 
                  rotate: [0, -10, 15, -10, 10, 0],
                  scale: 1.1,
                  boxShadow: "0 0 15px rgba(0,212,255,0.6)",
                  transition: { duration: 0.6 }
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-electric shadow-[0_0_10px_rgba(0,212,255,0.3)] border border-white/20 transition-all duration-300"
            >
              <Zap className="h-4 w-4 text-white" />
            </motion.div>
            <span className="font-heading text-base font-extrabold tracking-wider text-white transition-all duration-300 group-hover/mobbrand:text-accent group-hover/mobbrand:drop-shadow-[0_0_8px_rgba(0,212,255,0.5)] relative">
              CAMPUS-BANDHU
              <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-gradient-to-r from-accent to-purple transition-all duration-500 group-hover/mobbrand:w-full shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
            </span>
          </motion.div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate transition-colors hover:bg-white/10 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-72 glass-strong border-l border-white/[0.06] p-5 lg:hidden"
            >
              <div className="flex justify-end mb-4">
                <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-2 text-slate hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <MotionLink
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      whileHover="hover"
                      animate={isActive ? "active" : "default"}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                        isActive ? "bg-accent/10 text-accent font-semibold" : "text-slate hover:bg-white/[0.04] hover:text-white"
                      )}
                    >
                      {/* Shine glide inside mobile drawer links */}
                      <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                        <span className="absolute inset-0 -translate-x-full group-hover:animate-shine-glide bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </span>
                      <motion.div variants={getIconVariants(item.label)} className="relative z-10 shrink-0">
                        <Icon className={cn("h-4 w-4 transition-colors duration-300", isActive ? "text-accent" : "text-slate group-hover:text-white")} />
                      </motion.div>
                      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">{item.label}</span>
                    </MotionLink>
                  );
                })}
              </nav>
              {!isAuthenticated && (
                <button
                  onClick={() => { router.push("/auth"); setMobileMenuOpen(false); }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-electric py-2.5 text-sm font-semibold text-white"
                >
                  Sign In
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════ Main Content ══════ */}
      <main className="w-full min-w-0 pt-16 lg:pt-0 flex flex-col justify-between">
        <div className="flex-1">
          {children}
        </div>
        
        {/* LinkedIn-style LinkedIn Premium Footer */}
        <footer className="mt-16 border-t border-white/[0.08] pt-10 pb-8 text-[11px] text-slate">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {/* Col 1 */}
            <div className="flex flex-col gap-2.5">
              <a href="#" className="hover:text-white transition-colors font-medium">About</a>
              <a href="#" className="hover:text-white transition-colors font-medium">Community Guidelines</a>
              <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors font-medium">
                <span>Privacy & Terms</span>
                <ChevronDown className="h-3 w-3" />
              </div>
              <a href="#" className="hover:text-white transition-colors font-medium">Sales Solutions</a>
              <a href="#" className="hover:text-white transition-colors font-medium">Safety Center</a>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col gap-2.5">
              <a href="#" className="hover:text-white transition-colors font-medium">Accessibility</a>
              <a href="#" className="hover:text-white transition-colors font-medium">Careers</a>
              <a href="#" className="hover:text-white transition-colors font-medium">Ad Choices</a>
              <a href="#" className="hover:text-white transition-colors font-medium">Mobile</a>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col gap-2.5">
              <a href="#" className="hover:text-white transition-colors font-medium">Talent Solutions</a>
              <a href="#" className="hover:text-white transition-colors font-medium">Marketing Solutions</a>
              <a href="#" className="hover:text-white transition-colors font-medium">Advertising</a>
              <a href="#" className="hover:text-white transition-colors font-medium">Small Business</a>
            </div>

            {/* Col 4 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="h-4.5 w-4.5 text-slate shrink-0 mt-0.5" />
                <div>
                  <a href="#" className="hover:text-white hover:underline transition-colors font-bold text-white block">Questions?</a>
                  <p className="text-[10px] text-slate mt-0.5 leading-normal">Visit our Help Center.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Settings className="h-4.5 w-4.5 text-slate shrink-0 mt-0.5" />
                <div>
                  <a href="#" className="hover:text-white hover:underline transition-colors font-bold text-white block">Manage your account and privacy</a>
                  <p className="text-[10px] text-slate mt-0.5 leading-normal">Go to your Settings.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield className="h-4.5 w-4.5 text-slate shrink-0 mt-0.5" />
                <div>
                  <a href="#" className="hover:text-white hover:underline transition-colors font-bold text-white block">Recommendation transparency</a>
                  <p className="text-[10px] text-slate mt-0.5 leading-normal">Learn more about Recommended Content.</p>
                </div>
              </div>
            </div>

            {/* Col 5 */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate font-medium">Select language</label>
              <div className="relative w-full max-w-[200px]">
                <select className="h-9 w-full rounded-lg border border-white/10 bg-black/40 px-3 pr-8 text-[11px] text-slate transition-colors focus:border-white/20 focus:outline-none appearance-none cursor-pointer">
                  <option>English (English)</option>
                  <option>Spanish (Español)</option>
                  <option>French (Français)</option>
                  <option>Hindi (हिन्दी)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.04] pt-6">
            <span className="text-[10px] text-subtle font-medium">CAMPUS-BANDHU Corporation © 2026</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
