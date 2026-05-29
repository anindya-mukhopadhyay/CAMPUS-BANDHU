import { z } from "zod";
import mongoose from "mongoose";
import OpportunityModel from "../models/opportunity.model";

const opportunitySchema = z.object({
  company: z.string().min(2),
  role: z.string().min(2),
  title: z.string().optional(), // Compatibility
  description: z.string().min(10),
  skills: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]), // Compatibility
  stipendOrCtc: z.string().min(2),
  salary: z.string().optional(), // Compatibility
  applyUrl: z.string().url().optional(),
  id: z.string().optional()
});

export async function listOpportunities(): Promise<Record<string, unknown>[]> {
  const opportunities = await OpportunityModel.find({}).sort({ createdAt: -1 }).limit(30);
  return opportunities.map((doc) => doc.toJSON()) as any;
}

export async function createOpportunity(payload: unknown, recruiterId: string): Promise<Record<string, unknown>> {
  const parsed = opportunitySchema.parse(payload);
  
  const oppId = parsed.id || new mongoose.Types.ObjectId().toString();

  const data = {
    _id: oppId,
    ...parsed,
    recruiterId
  };

  const created = await OpportunityModel.create(data);
  return created.toJSON() as any;
}
