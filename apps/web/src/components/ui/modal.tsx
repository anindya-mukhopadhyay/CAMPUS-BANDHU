"use client";

import { type ReactNode, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "hacker";
};

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
};

export function Modal({ open, onClose, children, title, size = "md", className, variant = "default" }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (typeof window === "undefined") return null;

  const isHacker = variant === "hacker";

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed inset-0 z-50",
              isHacker ? "bg-black/80 backdrop-blur-md" : "bg-black/60 backdrop-blur-sm"
            )}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-h-[calc(100dvh-4rem)] overflow-y-auto flex flex-col",
              isHacker 
                ? "bg-[#060913] border border-white/[0.08] hover:border-accent/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,212,255,0.05)] text-white font-mono p-0 [&_input]:font-mono [&_textarea]:font-mono [&_select]:font-mono [&_button]:font-mono"
                : "glass-strong rounded-3xl p-6 shadow-float",
              sizeMap[size],
              className
            )}
          >
            {isHacker ? (
              <>
                {/* Hacker/Terminal Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.02] border-b border-white/[0.06] select-none shrink-0">
                  <div className="flex gap-1.5 items-center">
                    <button 
                      type="button"
                      onClick={onClose} 
                      className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] border border-rose-500/30 shadow-inner cursor-pointer hover:bg-rose-600 transition-colors"
                      title="Close Panel"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#fb923c] border border-orange-500/30 shadow-inner" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] border border-emerald-500/30 shadow-inner" />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate/40 uppercase tracking-[0.2em]">
                    {title ? `[cfg] - ${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.cfg` : "[cfg] - config.xml"}
                  </span>
                  <button 
                    type="button"
                    onClick={onClose} 
                    className="text-[9px] font-bold text-slate/50 hover:text-rose transition-colors uppercase cursor-pointer"
                  >
                    [X] Close
                  </button>
                </div>
                {/* Hacker Content Wrapper */}
                <div className="p-6 overflow-y-auto flex-1">
                  {children}
                </div>
              </>
            ) : (
              <>
                {/* Header */}
                {title && (
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold">{title}</h2>
                    <button
                      onClick={onClose}
                      className="rounded-xl p-2 text-slate transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {!title && (
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-xl p-2 text-slate transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}

                {children}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
