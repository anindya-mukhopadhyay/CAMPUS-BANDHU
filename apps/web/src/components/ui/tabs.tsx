"use client";

import { type ReactNode, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

type Tab = {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  variant?: "default" | "pills";
};

export function Tabs({ tabs, defaultTab, className, variant = "default" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        className={cn(
          "relative flex gap-1",
          variant === "default" && "border-b border-white/10 pb-px",
          variant === "pills" && "rounded-xl bg-white/[0.04] p-1"
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative z-10 flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                variant === "default" && "rounded-t-lg",
                variant === "pills" && "rounded-lg",
                isActive ? "text-white" : "text-slate hover:text-white/70"
              )}
            >
              {tab.icon}
              {tab.label}

              {/* Active indicator */}
              {isActive && variant === "default" && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent shadow-[0_0_10px_rgba(0,212,255,0.5)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {isActive && variant === "pills" && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-lg bg-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-4"
      >
        {activeContent}
      </motion.div>
    </div>
  );
}
