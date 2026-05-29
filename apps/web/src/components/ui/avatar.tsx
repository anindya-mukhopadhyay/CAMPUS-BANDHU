"use client";

import { cn } from "@/lib/utils/cn";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | "busy" | null;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
};

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg"
};

const statusSizeMap = {
  sm: "h-2.5 w-2.5 border",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
  xl: "h-4 w-4 border-2"
};

const statusColorMap = {
  online: "bg-mint",
  offline: "bg-slate/50",
  away: "bg-blaze",
  busy: "bg-rose"
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    "from-accent to-electric",
    "from-purple to-accent",
    "from-cyan to-mint",
    "from-blaze to-rose",
    "from-mint to-cyan",
    "from-electric to-purple"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length]!;
}

export function Avatar({ src, name, size = "md", status, glow = false, className, style, imageStyle }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex shrink-0 rounded-full", className)} style={style}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-full object-cover",
            sizeMap[size],
            glow && "ring-2 ring-accent/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
          )}
          style={imageStyle}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
            sizeMap[size],
            getColorFromName(name),
            glow && "ring-2 ring-accent/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
          )}
          style={imageStyle}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-base",
            statusSizeMap[size],
            statusColorMap[status]
          )}
        />
      )}
    </div>
  );
}
