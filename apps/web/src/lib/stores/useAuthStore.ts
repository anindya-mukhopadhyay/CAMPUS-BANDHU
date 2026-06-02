import { create } from "zustand";
import { type User } from "firebase/auth";

import { userService } from "@/services";

export type Role = "super_admin" | "college_admin" | "faculty" | "organizer" | "volunteer" | "student" | "recruiter";
export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  college_admin: "College Admin",
  faculty: "Faculty",
  organizer: "Organizer",
  volunteer: "Volunteer",
  student: "Student",
  recruiter: "Recruiter"
};

export const ROLE_COLORS: Record<Role, string> = {
  super_admin: "rose",
  college_admin: "purple",
  faculty: "cyan",
  organizer: "blaze",
  volunteer: "mint",
  student: "blue",
  recruiter: "purple"
} as const;

export type ProfileData = {
  fullName: string;
  userId?: string;
  department: string;
  graduationYear: number;
  bio: string;
  interests: string[];
  skills: string[];
  role: Role;
  skillLevels?: Record<string, number>;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  avatarZoom?: number;
  avatarX?: number;
  avatarY?: number;
  coverZoom?: number;
  coverY?: number;
  email?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  collegeId?: string;
  collegeName?: string;
  gender?: string;
  leetcodeUrl?: string;
  orcidUrl?: string;
  projects?: Array<{
    title: string;
    description: string;
    photoUrl?: string;
    youtubeLink?: string;
    githubLink?: string;
  }>;
  experience?: Array<{
    role: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  licenses?: Array<{
    name: string;
    issuer: string;
    issueDate?: string;
    credentialUrl?: string;
  }>;
  stats?: {
    eventsJoined: number;
    achievements: number;
    connections: number;
    xpPoints: number;
  };
};

type AuthState = {
  user: User | null;
  profile: ProfileData | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: ProfileData | null) => void;
  clearAuth: () => void;
  setRole: (role: Role) => Promise<void>;
  initializeProfile: (user: User) => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  setProfile: (profile) => set({ profile, role: profile?.role || null }),
  clearAuth: () => {
    set({
      user: null,
      profile: null,
      role: null,
      isAuthenticated: false,
      isLoading: false
    });
  },
  setRole: async (newRole: Role) => {
    const { user, profile } = get();
    if (!user) return;

    // Optimistically update locally
    set({ role: newRole, profile: profile ? { ...profile, role: newRole } : null });

    try {
      // Update role securely via Backend API
      await userService.updateProfile({ role: newRole });
    } catch (error) {
      console.error("Failed to update role via API:", error);
    }
  },
  updateProfile: async (data: Partial<ProfileData>) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    try {
      const response = await userService.updateProfile(data);
      set({ profile: response.data });
    } catch (error) {
      console.error("Failed to update profile via API:", error);
      // Local fallback in case of connection drop
      set({ profile: { ...profile, ...data } });
    }
  },
  initializeProfile: async (user: User) => {
    set({ isLoading: true });
    try {
      // Fetch profile from our Backend API (which auto-creates if new)
      const response = await userService.getMe();
      set({ profile: response.data, role: response.data.role, isLoading: false });
    } catch (error: any) {
      console.error("Critical: API profile initialization failed:", error);
      
      // Basic fallback profile structure
      set({
        profile: {
          fullName: user.displayName || "User",
          department: "Undeclared",
          graduationYear: new Date().getFullYear() + 4,
          bio: "",
          interests: [],
          skills: [],
          role: "student",
          avatarUrl: user.photoURL || undefined,
          email: user.email || undefined
        },
        role: "student",
        isLoading: false
      });
    }
  },
}));
