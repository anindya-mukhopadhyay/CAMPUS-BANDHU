"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { NeonBadge } from "@/components/ui/neon-badge";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { SuperAdminView } from "@/components/admin/SuperAdminView";
import { CollegeAdminView } from "@/components/admin/CollegeAdminView";

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

export default function AdminPage() {
  const { role, profile } = useAuthStore();
  const collegeName = profile?.collegeName || "Your College";

  return (
    <RoleGuard allowedRoles={["super_admin", "college_admin"]}>
      <AppShell>
        <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
          {/* Header */}
          <motion.div variants={stagger.item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold">
                {role === "super_admin" ? "Super Admin Center" : `${collegeName} Command Center`}
              </h1>
              <p className="mt-1 text-sm text-slate">
                {role === "super_admin" ? "Full platform oversight and management" : `Manage institutional data for ${collegeName}`}
              </p>
            </div>
            <NeonBadge color="rose" pulse>
              <Shield className="h-3 w-3" /> {role === "super_admin" ? "Global Admin Access" : "College Admin Access"}
            </NeonBadge>
          </motion.div>

          <motion.div variants={stagger.item}>
            {role === "super_admin" && <SuperAdminView />}
            {role === "college_admin" && <CollegeAdminView />}
          </motion.div>
        </motion.div>
      </AppShell>
    </RoleGuard>
  );
}
