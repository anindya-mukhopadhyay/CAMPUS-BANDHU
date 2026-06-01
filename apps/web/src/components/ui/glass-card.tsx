"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "subtle" | "holographic" | "liquid";
  hover?: boolean;
  glow?: "none" | "blue" | "purple" | "cyan" | "mint";
  padding?: "sm" | "md" | "lg";
};

const glowMap = {
  none: "",
  blue: "hover:shadow-neon",
  purple: "hover:shadow-neon-purple",
  cyan: "hover:shadow-neon-cyan",
  mint: "hover:shadow-[0_0_35px_rgba(56,242,181,0.35)]"
};

const paddingMap = {
  sm: "p-3",
  md: "p-5",
  lg: "p-7"
};

export function GlassCard({
  children,
  className,
  variant = "default",
  hover = true,
  glow = "none",
  padding = "md"
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        paddingMap[padding],
        (variant === "default" || variant === "liquid") && "glass",
        variant === "strong" && "glass-strong",
        variant === "subtle" && "glass-subtle",
        variant === "holographic" && "glass holographic",
        hover && "hover:-translate-y-0.5",
        glowMap[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
