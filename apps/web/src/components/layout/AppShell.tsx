"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BrainCircuit, Compass, LayoutGrid, Store, UserCircle2, Users,
  Briefcase, Shield, LogOut, Database, Menu, X, ChevronDown, Zap
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { type Role, ROLE_LABELS, ROLE_COLORS, useAuthStore } from "@/lib/stores/useAuthStore";
import { logout } from "@/lib/firebase/auth";
import { seedDemoDataFromClient } from "@/lib/utils/seed";
import { Avatar } from "@/components/ui/avatar";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";

type NavItem = {
  href: string;
  label: string;
  icon: any;
  allowedRoles?: Role[];
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
  { href: "/admin", label: "Admin Panel", icon: Shield, allowedRoles: ["super_admin", "college_admin"] }
];

const ALL_ROLES: Role[] = ["student", "volunteer", "organizer", "faculty", "recruiter", "college_admin", "super_admin"];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, setRole, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const filteredNav = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!role) return false;
    return item.allowedRoles.includes(role);
  });

  const handleSeed = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await seedDemoDataFromClient(user.uid, user.displayName || "Demo User");
      alert("✅ Demo data seeded!");
    } catch {
      alert("❌ Seed failed. Check console.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] gap-0 lg:gap-6 lg:px-6 lg:py-6">
      {/* ══════ Desktop Sidebar ══════ */}
      <aside className="hidden w-[280px] shrink-0 lg:block">
        <div className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col overflow-y-auto rounded-3xl glass-strong p-5 shadow-float">
          {/* Brand */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-electric shadow-glow-sm">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold tracking-wide">CAMPUS-BANDHU</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate">Smart Campus OS</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white"
                      : "text-slate hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-accent/10 border border-accent/20"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("relative z-10 h-4 w-4", isActive && "text-accent")} />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
                  )}
                </Link>
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
                <p className="font-heading text-lg font-bold text-accent"><AnimatedCounter value={85} /></p>
                <p className="text-[9px] text-slate">Events</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-lg font-bold text-mint"><AnimatedCounter value={2394} /></p>
                <p className="text-[9px] text-slate">Online</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-lg font-bold text-purple"><AnimatedCounter value={14} /></p>
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

                {/* Role Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate transition-colors hover:border-white/20 hover:text-white"
                  >
                    <span>Switch Role</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", roleSwitcherOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {roleSwitcherOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl glass-strong p-1 shadow-float"
                      >
                        {ALL_ROLES.map((r) => (
                          <button
                            key={r}
                            onClick={() => { setRole(r); setRoleSwitcherOpen(false); }}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors",
                              role === r ? "bg-accent/10 text-accent" : "text-slate hover:bg-white/[0.04] hover:text-white"
                            )}
                          >
                            {ROLE_LABELS[r]}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/10 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
                  >
                    <Database className="h-3.5 w-3.5" />
                    {isSeeding ? "..." : "Seed"}
                  </button>
                  <button
                    onClick={() => logout()}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] py-2 text-xs font-medium text-slate transition-colors hover:bg-white/[0.08] hover:text-white"
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
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-electric">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-sm font-bold">CAMPUS-BANDHU</span>
          </div>
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
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive ? "bg-accent/10 text-accent" : "text-slate hover:bg-white/[0.04] hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
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
      <main className="w-full min-w-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
