"use client";

import { useState } from "react";
import Link from "next/link";

import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

import { resetPassword } from "@/lib/firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError(err?.message || "Failed to send reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/3 h-96 w-96 rounded-full bg-purple/10 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 h-96 w-96 rounded-full bg-accent/8 blur-[120px]" />
      </div>
      <div className="grid-background pointer-events-none absolute inset-0 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 shadow-float">
          {sent ? (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint/10"
              >
                <CheckCircle2 className="h-8 w-8 text-mint" />
              </motion.div>
              <h2 className="font-heading text-2xl font-bold">Check your email</h2>
              <p className="mt-3 text-sm text-slate">
                We sent a password reset link to <span className="font-medium text-white">{email}</span>.
                Click the link in the email to reset your password.
              </p>
              <Link
                href="/auth"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth" className="mb-6 inline-flex items-center gap-2 text-sm text-slate transition-colors hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>

              <h2 className="font-heading text-2xl font-bold">Reset password</h2>
              <p className="mt-2 text-sm text-slate">
                Enter the email address associated with your account and we will send you a link to reset your password.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 rounded-xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@campus.edu"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-electric py-3 text-sm font-semibold text-white shadow-neon transition-all hover:shadow-glow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Send Reset Link
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
