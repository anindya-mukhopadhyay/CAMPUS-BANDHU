import { z } from "zod";

import { firestore } from "../config/firebase-admin";

const opportunitiesRef = firestore.collection("opportunities");

const opportunitySchema = z.object({
  company: z.string().min(2),
  role: z.string().min(2),
  description: z.string().min(10),
  skills: z.array(z.string()).default([]),
  stipendOrCtc: z.string().min(2),
  applyUrl: z.string().url()
});

export async function listOpportunities(): Promise<Record<string, unknown>[]> {
  const snapshot = await opportunitiesRef.orderBy("createdAt", "desc").limit(30).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createOpportunity(payload: unknown, recruiterId: string): Promise<Record<string, unknown>> {
  const parsed = opportunitySchema.parse(payload);
  const data = {
    ...parsed,
    recruiterId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const created = await opportunitiesRef.add(data);
  return { id: created.id, ...data };
}
