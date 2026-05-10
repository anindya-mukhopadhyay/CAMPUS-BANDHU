import { z } from "zod";

import { firestore } from "../config/firebase-admin";

const profilesRef = firestore.collection("profiles");

const profileSchema = z.object({
  fullName: z.string().min(3),
  department: z.string().min(2),
  graduationYear: z.number().min(2000).max(2100),
  bio: z.string().max(400).default(""),
  interests: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([])
});

export async function getProfileById(userId: string): Promise<Record<string, unknown>> {
  const snapshot = await profilesRef.doc(userId).get();
  if (!snapshot.exists) {
    const defaults = {
      fullName: "New User",
      department: "Undeclared",
      graduationYear: new Date().getFullYear() + 4,
      bio: "",
      interests: [],
      skills: [],
      role: "student",
      updatedAt: new Date().toISOString()
    };

    await profilesRef.doc(userId).set(defaults);
    return { id: userId, ...defaults };
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function updateProfile(userId: string, payload: unknown): Promise<Record<string, unknown>> {
  const parsed = profileSchema.partial().parse(payload);

  await profilesRef.doc(userId).set(
    {
      ...parsed,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  const updated = await profilesRef.doc(userId).get();
  return { id: updated.id, ...updated.data() };
}

export async function addSkill(userId: string, skill: string): Promise<Record<string, unknown>> {
  const profile = await getProfileById(userId);
  const existingSkills = (profile.skills as string[] | undefined) ?? [];

  if (!existingSkills.includes(skill)) {
    existingSkills.push(skill);
  }

  await profilesRef.doc(userId).set(
    {
      skills: existingSkills,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  return { id: userId, skills: existingSkills };
}
