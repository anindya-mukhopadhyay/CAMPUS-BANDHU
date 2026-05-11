import { create } from "zustand";
import { type User } from "firebase/auth";

import { db } from "../firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
  department: string;
  graduationYear: number;
  bio: string;
  interests: string[];
  skills: string[];
  role: Role;
  avatarUrl?: string;
  email?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  collegeId?: string;
  collegeName?: string;
};

type AuthState = {
  user: User | null;
  profile: ProfileData | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: ProfileData | null) => void;
  setRole: (role: Role) => Promise<void>;
  initializeProfile: (user: User) => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  mockLogin: (role: Role, collegeId?: string, collegeName?: string) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile, role: profile?.role || null }),
  setRole: async (newRole: Role) => {
    const { user, profile } = get();
    if (!user) return;

    set({ role: newRole, profile: profile ? { ...profile, role: newRole } : null });

    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, { role: newRole, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Failed to update role in Firestore:", error);
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
      // Local fallback
      set({ profile: { ...profile, ...data } });
    }
  },
  initializeProfile: async (user: User) => {
    set({ isLoading: true });
    try {
      // 1. Try to fetch profile from our Backend API
      const response = await userService.getMe();
      set({ profile: response.data, role: response.data.role, isLoading: false });
    } catch (error: any) {
      console.warn("API profile fetch failed, falling back to local Firestore:", error);
      
      // 2. Fallback to direct Firestore if API is down or user is new
      try {
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as ProfileData;
          set({ profile: data, role: data.role, isLoading: false });
        } else {
          const newProfile: ProfileData = {
            fullName: user.displayName || "New User",
            department: "Undeclared",
            graduationYear: new Date().getFullYear() + 4,
            bio: "",
            interests: [],
            skills: [],
            role: "student",
            avatarUrl: user.photoURL || undefined,
            email: user.email || undefined
          };
          await setDoc(docRef, { ...newProfile, createdAt: new Date().toISOString() });
          set({ profile: newProfile, role: newProfile.role, isLoading: false });
        }
      } catch (innerError: any) {
        console.error("Critical: Both API and Firestore failed:", innerError);
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
    }
  },
  mockLogin: (role, collegeId, collegeName) => {
    const mockUser = {
      uid: "mock-uid",
      email: "admin@campus.edu",
      displayName: "Mock Admin",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=mock",
    } as any;

    const mockProfile: ProfileData = {
      fullName: "Mock Admin",
      department: "Administration",
      graduationYear: 2024,
      bio: "Demo administration account.",
      interests: ["governance", "efficiency"],
      skills: ["management"],
      role,
      collegeId,
      collegeName,
      email: "admin@campus.edu"
    };

    set({ 
      user: mockUser, 
      profile: mockProfile, 
      role, 
      isAuthenticated: true, 
      isLoading: false 
    });
  }
}));
