"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type NeonBadgeProps = {
  children: ReactNode;
  color?: "blue" | "purple" | "cyan" | "mint" | "blaze" | "rose";
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
};

const colorStyles = {
  blue: "bg-accent/10 text-accent border-accent/30 shadow-[0_0_12px_rgba(0,212,255,0.15)]",
  purple: "bg-purple/10 text-purple border-purple/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]",
  cyan: "bg-cyan/10 text-cyan border-cyan/30 shadow-[0_0_12px_rgba(34,211,238,0.15)]",
  mint: "bg-mint/10 text-mint border-mint/30 shadow-[0_0_12px_rgba(56,242,181,0.15)]",
  blaze: "bg-blaze/10 text-blaze border-blaze/30 shadow-[0_0_12px_rgba(255,122,24,0.15)]",
  rose: "bg-rose/10 text-rose border-rose/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs"
};

export function NeonBadge({ children, color = "blue", size = "md", pulse = false, className }: NeonBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider",
        colorStyles[color],
        sizeStyles[size],
        pulse && "animate-glow-pulse",
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              color === "blue" && "bg-accent",
              color === "purple" && "bg-purple",
              color === "cyan" && "bg-cyan",
              color === "mint" && "bg-mint",
              color === "blaze" && "bg-blaze",
              color === "rose" && "bg-rose"
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              color === "blue" && "bg-accent",
              color === "purple" && "bg-purple",
              color === "cyan" && "bg-cyan",
              color === "mint" && "bg-mint",
              color === "blaze" && "bg-blaze",
              color === "rose" && "bg-rose"
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
