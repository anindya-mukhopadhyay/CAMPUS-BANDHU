"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
};

const iconMap: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-mint" />,
  error: <XCircle className="h-5 w-5 text-rose" />,
  warning: <AlertTriangle className="h-5 w-5 text-blaze" />,
  info: <Info className="h-5 w-5 text-accent" />
};

const borderColorMap: Record<ToastType, string> = {
  success: "border-l-mint",
  error: "border-l-rose",
  warning: "border-l-blaze",
  info: "border-l-accent"
};

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastState: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastState]));
}

export function toast(options: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2, 9);
  const newToast: Toast = { ...options, id, duration: options.duration ?? 4000 };
  toastState = [...toastState, newToast];
  notifyListeners();

  const dur = newToast.duration ?? 4000;
  if (dur > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, dur);
  }
}

export function dismissToast(id: string) {
  toastState = toastState.filter((t) => t.id !== id);
  notifyListeners();
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  if (!mounted || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3" style={{ maxWidth: 400 }}>
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "glass-strong flex items-start gap-3 rounded-xl border-l-4 p-4 shadow-float",
              borderColorMap[t.type]
            )}
          >
            <span className="mt-0.5 shrink-0">{iconMap[t.type]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-1 text-xs text-slate">{t.description}</p>}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="shrink-0 rounded-lg p-1 text-slate transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
