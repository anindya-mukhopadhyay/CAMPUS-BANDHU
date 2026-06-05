import { z } from "zod";
import UserModel from "../models/user.model";
import EventModel from "../models/event.model";
import AchievementModel from "../models/achievement.model";
import ChatModel from "../models/chat.model";

const profileSchema = z.object({
  fullName: z.string().min(3),
  userId: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
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
  coverX: z.number().optional(),
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

export async function generateUniqueUserId(base: string): Promise<string> {
  const cleanBase = base.toLowerCase().replace(/[^a-z0-9_]/g, "_").substring(0, 20);
  let candidate = cleanBase || "user";
  
  let exists = await UserModel.findOne({ userId: candidate });
  if (!exists) return candidate;
  
  let count = 1;
  while (true) {
    const suffix = count.toString();
    const truncatedBase = cleanBase.substring(0, 30 - suffix.length - 1);
    candidate = `${truncatedBase}_${suffix}`;
    exists = await UserModel.findOne({ userId: candidate });
    if (!exists) return candidate;
    count++;
  }
}

export async function getProfileById(userId: string): Promise<Record<string, unknown>> {
  const user = await UserModel.findOne({ uid: userId });

  // Calculate real stats
  const [eventsJoined, achievements, connections] = await Promise.all([
    EventModel.countDocuments({ registeredStudentIds: userId }),
    AchievementModel.countDocuments({ studentId: userId }),
    ChatModel.countDocuments({ participants: userId })
  ]);
  const xpPoints = (eventsJoined * 50) + (achievements * 200) + (connections * 10);
  
  const stats = { eventsJoined, achievements, connections, xpPoints };

  if (!user) {
    const email = `${userId.substring(0, 8)}@campus.edu`;
    const defaultHandle = await generateUniqueUserId(userId.substring(0, 8));
    const defaults = {
      uid: userId,
      userId: defaultHandle,
      email,
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
    return { ...created.toJSON(), stats } as any;
  }

  return { ...user.toJSON(), stats } as any;
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
