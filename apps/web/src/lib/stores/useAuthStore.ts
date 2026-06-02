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
  mockLogin: (role, collegeId, collegeName) => {
    let mockUser: any;
    let mockProfile: ProfileData;

    if (role === "super_admin") {
      mockUser = {
        uid: "mock-super-admin-uid",
        email: "superadmin@gmail.com",
        displayName: "Super Admin",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin",
      };
      mockProfile = {
        fullName: "System Administrator",
        userId: "system_admin",
        department: "IT Services",
        graduationYear: 2020,
        bio: "Global platform overseer and administrator.",
        interests: ["infrastructure", "security"],
        skills: ["Kubernetes", "MongoDB", "SysAdmin"],
        role: "super_admin",
        email: "superadmin@gmail.com"
      };
    } else if (role === "college_admin") {
      mockUser = {
        uid: "mock-college-admin-uid",
        email: "admin@gmail.com",
        displayName: "College Admin",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=collegeadmin",
      };
      mockProfile = {
        fullName: "Dean of Academic Affairs",
        userId: "college_admin",
        department: "Administration",
        graduationYear: 2005,
        bio: "Campus administration director.",
        interests: ["academics", "governance"],
        skills: ["Leadership", "Management"],
        role: "college_admin",
        collegeId: collegeId || "col-123",
        collegeName: collegeName || "Netaji Subhas University",
        email: "admin@gmail.com"
      };
    } else if (role === "faculty") {
      mockUser = {
        uid: "mock-faculty-uid",
        email: "faculty@gmail.com",
        displayName: "Faculty Member",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=faculty",
      };
      mockProfile = {
        fullName: "Dr. Vikram Singh",
        userId: "vikram_singh",
        department: "Computer Science",
        graduationYear: 1998,
        bio: "Professor researching Distributed Systems, IoT, and AI.",
        interests: ["research", "iot", "distributed systems"],
        skills: ["MATLAB", "Embedded Systems", "Python"],
        role: "faculty",
        email: "faculty@gmail.com"
      };
    } else if (role === "recruiter") {
      mockUser = {
        uid: "mock-recruiter-uid",
        email: "recruiter@gmail.com",
        displayName: "Sarah Jenkins",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=recruiter",
      };
      mockProfile = {
        fullName: "Sarah Jenkins",
        userId: "sarah_recruiter",
        department: "Talent Acquisition",
        graduationYear: 2015,
        bio: "University recruiter at GlobalTech Inc.",
        interests: ["hiring", "networking"],
        skills: ["Recruitment", "Interviewing"],
        role: "recruiter",
        email: "recruiter@gmail.com"
      };
    } else {
      mockUser = {
        uid: "mock-student-uid",
        email: "student@gmail.com",
        displayName: "Alice Sharma",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=student",
      };
      mockProfile = {
        fullName: "Alice Sharma",
        userId: "alice_sharma",
        department: "Computer Science",
        graduationYear: 2025,
        bio: "Passionate student builder exploring modern tech.",
        interests: ["ai", "web3", "hackathons"],
        skills: ["React", "Node.js", "Python"],
        role: "student",
        email: "student@gmail.com"
      };
    }

    set({ 
      user: mockUser, 
      profile: mockProfile, 
      role, 
      isAuthenticated: true, 
      isLoading: false 
    });
  }
}));
