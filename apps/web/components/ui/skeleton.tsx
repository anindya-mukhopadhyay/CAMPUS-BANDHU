"use client";

import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  lines?: number;
};

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 rounded-lg bg-white/[0.06]",
        "relative overflow-hidden",
        "after:absolute after:inset-0",
        "after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent",
        "after:animate-shimmer after:bg-[length:200%_100%]",
        className
      )}
    />
  );
}

export function Skeleton({ className, variant = "text", lines = 1 }: SkeletonProps) {
  if (variant === "circular") {
    return (
      <div
        className={cn(
          "h-10 w-10 rounded-full bg-white/[0.06]",
          "relative overflow-hidden",
          "after:absolute after:inset-0",
          "after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent",
          "after:animate-shimmer after:bg-[length:200%_100%]",
          className
        )}
      />
    );
  }

  if (variant === "rectangular") {
    return (
      <div
        className={cn(
          "h-32 w-full rounded-2xl bg-white/[0.06]",
          "relative overflow-hidden",
          "after:absolute after:inset-0",
          "after:bg-gradient-to-r after:from-transparent after:via-white/[0.04] after:to-transparent",
          "after:animate-shimmer after:bg-[length:200%_100%]",
          className
        )}
      />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}
