"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

import { loginWithEmail, loginWithGoogle, logout } from "@/lib/firebase/auth";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { authService, userService } from "@/services";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === "recruiter") {
        router.replace("/recruiters");
      } else if (role === "faculty") {
        router.replace("/faculty");
      } else if (role === "college_admin" || role === "super_admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, role, router]);

  if (isAuthenticated && role) {
    return null;
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        if (!userIdInput.trim()) {
          setError("Please choose a unique User ID.");
          setLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(userIdInput)) {
          setError("User ID must be 3-30 alphanumeric characters or underscores.");
          setLoading(false);
          return;
        }
        await authService.signup({
          email,
          password,
          fullName: name,
          userId: userIdInput.toLowerCase().trim()
        });
        await loginWithEmail(email, password);
      }
      
      const res = await authService.login();
      const profile = res.data;

      if (profile.role === "super_admin" || profile.role === "college_admin" || profile.role === "recruiter" || profile.role === "faculty") {
        await logout();
        useAuthStore.setState({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
        setError("Please use the Admin, Recruiter & Faculty Portal to sign in.");
        setLoading(false);
        return;
      }

      if (profile.status === "pending") {
        await logout();
        useAuthStore.setState({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
        setError("Your account is pending Super Admin approval. You cannot log in yet.");
        setLoading(false);
        return;
      }

      if (profile.status === "rejected") {
        await logout();
        useAuthStore.setState({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
        setError("Your account registration request has been rejected.");
        setLoading(false);
        return;
      }

      router.replace("/");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(err?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      
      const res = await authService.login();
      const profile = res.data;

      if (profile.role === "super_admin" || profile.role === "college_admin" || profile.role === "recruiter" || profile.role === "faculty") {
        await logout();
        useAuthStore.setState({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
        setError("Please use the Admin, Recruiter & Faculty Portal to sign in.");
        setLoading(false);
        return;
      }

      if (profile.status === "pending") {
        await logout();
        useAuthStore.setState({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
        setError("Your account is pending Super Admin approval. You cannot log in yet.");
        setLoading(false);
        return;
      }

      if (profile.status === "rejected") {
        await logout();
        useAuthStore.setState({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
        setError("Your account registration request has been rejected.");
        setLoading(false);
        return;
      }

      router.replace("/");
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/5 blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div className="grid-background pointer-events-none absolute inset-0 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-electric shadow-neon"
          >
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="font-heading text-3xl font-bold">
            <span className="bg-gradient-to-r from-white via-white to-slate bg-clip-text text-transparent">CAMPUS-BANDHU</span>
          </h1>
          <p className="mt-2 text-sm text-slate">Smart Campus Operating System</p>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-float">
          {/* Mode Toggle */}
          <div className="mb-6 flex rounded-xl bg-white/[0.04] p-1">
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`relative flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  mode === m ? "text-white" : "text-slate hover:text-white/70"
                }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{m === "login" ? "Sign In" : "Create Account"}</span>
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {mode === "register" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate">Choose unique User ID</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-accent">@</span>
                      <input
                        type="text"
                        value={userIdInput}
                        onChange={(e) => setUserIdInput(e.target.value)}
                        placeholder="username"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-8 pr-4 text-sm text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                      />
                    </div>
                    <span className="text-[10px] text-slate mt-1 block">3-30 letters, numbers or underscores</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate">Password</label>
                {mode === "login" && (
                  <a href="/auth/forgot-password" className="text-xs text-accent transition-colors hover:text-accent/80">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-12 text-sm text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate transition-colors hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-subtle">or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Others / Recruiters / Admins Portal */}
          <div className="mt-5 border-t border-white/5 pt-4 text-center">
            <span className="text-xs text-subtle">Are you a recruiter or administrator? </span>
            <button
              type="button"
              onClick={() => router.push("/auth/portal")}
              className="text-xs font-semibold text-accent transition-colors hover:text-accent/80 hover:underline"
            >
              Use Others Portal
            </button>
          </div>
        </div>

        {/* Bottom text */}
        <p className="mt-6 text-center text-xs text-subtle">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>


      </motion.div>
    </div>
  );
}
