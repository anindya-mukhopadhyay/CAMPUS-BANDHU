"use client";

import { useEffect, useRef } from "react";

import { motion } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

import { CampusOrb } from "@/components/3d/CampusOrb";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { NeonBadge } from "@/components/ui/neon-badge";

const stats = [
  { label: "Students Active", value: 12480, suffix: "+", color: "text-accent" },
  { label: "Events This Month", value: 156, suffix: "", color: "text-mint" },
  { label: "Career Matches", value: 2340, suffix: "+", color: "text-purple" },
  { label: "NFT Achievements", value: 890, suffix: "", color: "text-blaze" }
];

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (titleRef.current) {
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 30, filter: "blur(12px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }
      );
    }

    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.5"
      );
    }
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
      {/* Content Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        className="glass-card relative overflow-hidden"
      >
        {/* Grid background */}
        <div className="grid-background pointer-events-none absolute inset-0 opacity-40" />

        {/* Ambient glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-accent/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-purple/8 blur-[80px]" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <NeonBadge color="blue" pulse>AI Powered</NeonBadge>
            <NeonBadge color="purple">Campus OS v2.0</NeonBadge>
          </div>

          <h2
            ref={titleRef}
            className="max-w-xl font-heading text-3xl font-bold leading-[1.15] md:text-4xl lg:text-[2.75rem]"
          >
            One intelligent platform for{" "}
            <span className="bg-gradient-to-r from-accent via-cyan to-mint bg-clip-text text-transparent">
              identity, events, growth
            </span>
            , and campus opportunity.
          </h2>

          <p
            ref={subtitleRef}
            className="mt-5 max-w-2xl text-sm leading-relaxed text-white md:text-base"
            style={{ color: "#ffffff" }}
          >
            CAMPUS-BANDHU unifies verified profiles, live engagement, marketplace,
            and recruiter signals into an AI-driven operating system with real-time personalization.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button>
              Launch Command
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button variant="outline">
              <TrendingUp className="mr-1.5 h-4 w-4" />
              Realtime Analytics
            </Button>
            <Button variant="blaze">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Mint Achievement
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center"
              >
                <p className={`font-heading text-xl font-bold ${stat.color}`}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 3D Orb Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <CampusOrb />
      </motion.div>
    </div>
  );
}
