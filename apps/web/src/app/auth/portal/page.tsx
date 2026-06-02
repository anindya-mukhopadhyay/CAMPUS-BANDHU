"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles,
  Building2, School, ShieldAlert, ArrowLeft, Briefcase
} from "lucide-react";

import { loginWithEmail, loginWithGoogle, logout } from "@/lib/firebase/auth";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { authService, userService } from "@/services";

type PortalType = "recruiter" | "admin" | "faculty";
type AuthMode = "login" | "register";

export default function OthersPortalPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  
  // Portal & Auth States
  const [portalType, setPortalType] = useState<PortalType>("recruiter");
  const [mode, setMode] = useState<AuthMode>("login");
  
  // Form Input States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [company, setCompany] = useState("");
  const [collegeName, setCollegeName] = useState("");

  
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
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || "superadmin@gmail.com";
        const superAdminPassword = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || "1234567890";

        if (email === superAdminEmail && password === superAdminPassword) {
          useAuthStore.getState().mockLogin("super_admin");
          router.replace("/admin");
          setLoading(false);
          return;
        }

        // Mock Login for College Admin
        if (email === "admin@gmail.com" && password === "1234567890") {
          useAuthStore.getState().mockLogin("college_admin");
          router.replace("/admin");
          setLoading(false);
          return;
        }

        // Mock Login for Faculty
        if (email === "faculty@gmail.com" && password === "1234567890") {
          useAuthStore.getState().mockLogin("faculty");
          router.replace("/faculty");
          setLoading(false);
          return;
        }

        // Mock Login for Recruiter
        if (email === "recruiter@gmail.com" && password === "1234567890") {
          useAuthStore.getState().mockLogin("recruiter");
          router.replace("/recruiters");
          setLoading(false);
          return;
        }

        await loginWithEmail(email, password);
      } else {
        // Sign Up Validation
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

        const signupPayload: any = {
          email,
          password,
          fullName: name,
          userId: userIdInput.toLowerCase().trim(),
        };

        if (portalType === "recruiter") {
          if (!company.trim()) {
            setError("Please enter your company/organization name.");
            setLoading(false);
            return;
          }
          signupPayload.role = "recruiter";
          signupPayload.department = company; // Map company to department field
        } else if (portalType === "faculty") {
          if (!collegeName.trim()) {
            setError("Please enter your college name.");
            setLoading(false);
            return;
          }
          signupPayload.role = "faculty";
          signupPayload.collegeName = collegeName;
          signupPayload.department = "Academic Faculty";
        } else {
          if (!collegeName.trim()) {
            setError("Please enter your college name.");
            setLoading(false);
            return;
          }
          signupPayload.role = "college_admin";
          signupPayload.collegeName = collegeName;
          signupPayload.department = "Administration";
        }

        await authService.signup(signupPayload);
        await loginWithEmail(email, password);
      }
      
      const res = await userService.getMe();
      const profile = res.data;

      if (profile.role !== "super_admin" && profile.role !== "college_admin" && profile.role !== "recruiter" && profile.role !== "faculty") {
        await logout();
        useAuthStore.setState({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
        setError("Please use the Student Portal to sign in.");
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
      
      // Verification logic after login
      setTimeout(async () => {
        const currentRole = useAuthStore.getState().role;
        if (currentRole === "recruiter") {
          router.replace("/recruiters");
        } else if (currentRole === "college_admin" || currentRole === "super_admin") {
          router.replace("/admin");
        } else if (currentRole === "faculty") {
          router.replace("/faculty");
        } else {
          router.replace("/");
        }
      }, 500);

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
      
      const res = await userService.getMe();
      const profile = res.data;

      if (profile.role !== "super_admin" && profile.role !== "college_admin" && profile.role !== "recruiter" && profile.role !== "faculty") {
        await logout();
        useAuthStore.setState({ user: null, profile: null, role: null, isAuthenticated: false, isLoading: false });
        setError("Please use the Student Portal to sign in.");
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

      setTimeout(async () => {
        const currentRole = useAuthStore.getState().role;
        if (currentRole === "recruiter") {
          router.replace("/recruiters");
        } else if (currentRole === "college_admin" || currentRole === "super_admin") {
          router.replace("/admin");
        } else if (currentRole === "faculty") {
          router.replace("/faculty");
        } else {
          router.replace("/");
        }
      }, 500);
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-rose/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/5 blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div className="grid-background pointer-events-none absolute inset-0 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-lg"
      >
        {/* Brand */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple to-rose shadow-neon-purple"
          >
            <Sparkles className="h-6 w-6 text-white" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold">
            <span className="bg-gradient-to-r from-white via-white to-slate bg-clip-text text-transparent">CAMPUS-BANDHU</span>
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate">Professional & Admin Portal</p>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-float">
          
          {/* Portal Tabs: Recruiter vs Admin vs Faculty */}
          <div className="mb-6 flex gap-3 border-b border-white/5 pb-4">
            <button
              onClick={() => { setPortalType("recruiter"); setError(null); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                portalType === "recruiter"
                  ? "bg-purple/20 text-purple border border-purple/30 shadow-glow-sm"
                  : "bg-white/[0.02] text-slate hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Recruiter
            </button>
            <button
              onClick={() => { setPortalType("admin"); setError(null); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                portalType === "admin"
                  ? "bg-rose/20 text-rose border border-rose/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                  : "bg-white/[0.02] text-slate hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin
            </button>
            <button
              onClick={() => { setPortalType("faculty"); setError(null); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                portalType === "faculty"
                  ? "bg-cyan/20 text-cyan border border-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "bg-white/[0.02] text-slate hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <School className="h-3.5 w-3.5" />
              Faculty
            </button>
          </div>

          {/* Mode Switcher: Sign In vs Create Account */}
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
                    layoutId="portal-tab"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {m === "login" ? "Sign In" : "Create Account"}
                </span>
              </button>
            ))}
          </div>

          {/* Error message */}
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

          {/* Dynamic Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <AnimatePresence mode="popLayout">
              {mode === "register" && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                      />
                    </div>
                  </div>

                  {/* Choose unique User ID */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate">Choose Unique User ID</label>
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

                  {/* Portal-Specific Fields */}
                  {portalType === "recruiter" ? (
                    /* Recruiter: Company */
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate">Company / Organization</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Google, TechCorp"
                          required
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-subtle transition-colors focus:border-purple/50 focus:outline-none focus:ring-1 focus:ring-purple/30"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Admin & Faculty: College Name */
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate">College / University Name</label>
                        <div className="relative">
                          <School className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                          <input
                            type="text"
                            value={collegeName}
                            onChange={(e) => setCollegeName(e.target.value)}
                            placeholder="e.g. Netaji Subhas University"
                            required
                            className={`w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-subtle transition-colors focus:outline-none focus:ring-1 ${
                              portalType === "faculty"
                                ? "focus:border-cyan/50 focus:ring-cyan/30"
                                : "focus:border-rose/50 focus:ring-rose/30"
                            }`}
                          />
                        </div>
                      </div>

                      {portalType === "admin" ? (
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-3.5 text-center">
                          <p className="text-xs text-rose font-semibold">🔒 College Admin Account Only</p>
                          <p className="mt-1 text-[10px] text-slate">Super Admin accounts are built-in by default and cannot be registered.</p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-3.5 text-center">
                          <p className="text-xs text-cyan font-semibold">🎓 Faculty Account Verification</p>
                          <p className="mt-1 text-[10px] text-slate">Faculty accounts require review and verification from your institutional College Admin before access is granted.</p>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com or admin@college.edu"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate">Password</label>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-neon transition-all disabled:opacity-50 ${
                portalType === "recruiter"
                  ? "bg-gradient-to-r from-purple to-electric hover:shadow-neon-purple"
                  : portalType === "faculty"
                  ? "bg-gradient-to-r from-cyan to-electric hover:shadow-neon-cyan"
                  : "bg-gradient-to-r from-rose to-purple hover:shadow-neon-rose"
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  {mode === "login" ? `Sign In as ${portalType === "recruiter" ? "Recruiter" : portalType === "faculty" ? "Faculty" : "Admin"}` : "Create Portal Account"}
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
        </div>

        {/* Go Back Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/auth")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Student Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
}
