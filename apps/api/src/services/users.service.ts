import { z } from "zod";
import UserModel from "../models/user.model";

const profileSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email().optional(),
  department: z.string().min(2),
  graduationYear: z.number().min(2000).max(2100),
  bio: z.string().max(400).default(""),
  interests: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  avatarUrl: z.string().optional(),
  coverPhotoUrl: z.string().optional(),
  avatarZoom: z.number().optional(),
  avatarX: z.number().optional(),
  avatarY: z.number().optional(),
  coverZoom: z.number().optional(),
  coverY: z.number().optional(),
  githubUrl: z.string().optional().or(z.literal("")),
  linkedinUrl: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().optional(),
  collegeId: z.string().optional(),
  collegeName: z.string().optional(),
  gender: z.string().optional(),
  leetcodeUrl: z.string().optional().or(z.literal("")),
  orcidUrl: z.string().optional().or(z.literal("")),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    photoUrl: z.string().optional(),
    youtubeLink: z.string().optional().or(z.literal("")),
    githubLink: z.string().optional().or(z.literal(""))
  })).optional(),
  experience: z.array(z.object({
    role: z.string(),
    company: z.string(),
    duration: z.string(),
    description: z.string().optional()
  })).optional(),
  licenses: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string().optional(),
    credentialUrl: z.string().optional().or(z.literal(""))
  })).optional(),
  skillLevels: z.record(z.string(), z.number()).optional()
});

export async function getProfileById(userId: string): Promise<Record<string, unknown>> {
  const user = await UserModel.findOne({ uid: userId });
  if (!user) {
    const defaults = {
      uid: userId,
      email: `${userId.substring(0, 8)}@campus.edu`, // Mock email placeholder
      fullName: "New User",
      department: "Undeclared",
      graduationYear: new Date().getFullYear() + 4,
      bio: "",
      interests: [],
      skills: [],
      role: "student",
      status: "active"
    };

    const created = await UserModel.create(defaults);
    return created.toJSON() as any;
  }

  return user.toJSON() as any;
}

export async function updateProfile(userId: string, payload: unknown): Promise<Record<string, unknown>> {
  const parsed = profileSchema.partial().parse(payload);

  const updated = await UserModel.findOneAndUpdate(
    { uid: userId },
    { $set: parsed },
    { new: true, upsert: true }
  );

  return updated.toJSON() as any;
}

export async function addSkill(userId: string, skill: string): Promise<Record<string, unknown>> {
  const updated = await UserModel.findOneAndUpdate(
    { uid: userId },
    { $addToSet: { skills: skill } },
    { new: true }
  );

  if (!updated) {
    throw new Error("User profile not found");
  }

  return { id: userId, skills: updated.skills };
}
