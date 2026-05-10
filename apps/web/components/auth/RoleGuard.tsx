"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { ShieldX, ArrowLeft } from "lucide-react";

import { type Role, useAuthStore } from "@/lib/stores/useAuthStore";

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: Role[];
  fallbackRoute?: string;
};

export function RoleGuard({ children, allowedRoles, fallbackRoute = "/" }: RoleGuardProps) {
  const { role, isLoading, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-purple" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[500px] w-full items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong max-w-md rounded-3xl p-8 text-center shadow-float"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <ShieldX className="h-8 w-8 text-accent" />
          </div>
          <h2 className="font-heading text-2xl font-bold">Authentication Required</h2>
          <p className="mt-3 text-sm text-slate">Sign in to access this page and unlock the full Campus-Bandhu experience.</p>
          <button
            onClick={() => router.push("/auth")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-electric px-6 py-3 text-sm font-semibold text-white shadow-neon transition-shadow hover:shadow-glow-lg"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  if (role && !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-[500px] w-full items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong max-w-md rounded-3xl p-8 text-center shadow-float"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose/10">
            <ShieldX className="h-8 w-8 text-rose" />
          </div>
          <h2 className="font-heading text-2xl font-bold">Access Restricted</h2>
          <p className="mt-3 text-sm text-slate">
            Your current role does not have permission to access this page. Contact an administrator if you believe this is an error.
          </p>
          <button
            onClick={() => router.push(fallbackRoute)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
