import { Schema, model, Types } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IOpportunity {
  _id?: string;
  company: string;
  role: string;
  title?: string; // Compatibility
  description: string;
  skills: string[];
  requirements?: string[]; // Compatibility
  stipendOrCtc: string;
  salary?: string; // Compatibility
  applyUrl: string;
  recruiterId: string;
  location?: string;
  type?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const opportunitySchema = new Schema<IOpportunity>(
  {
    _id: { type: String, default: () => new Types.ObjectId().toString() },
    company: { type: String, required: true },
    role: { type: String, required: true },
    title: { type: String }, // Compatibility field
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    requirements: { type: [String], default: [] }, // Compatibility field
    stipendOrCtc: { type: String, required: true },
    salary: { type: String }, // Compatibility field
    applyUrl: { type: String, default: "https://campus-bandhu.vercel.app/opportunities" },
    recruiterId: { type: String, required: true },
    location: { type: String, default: "Campus" },
    type: { type: String, default: "Full-time" },
    status: { type: String, default: "open" }
  },
  schemaOptions
);

opportunitySchema.pre("save", function (this: any) {
  // Sync role / title
  if (this.role && !this.title) {
    this.title = this.role;
  }
  if (!this.role && this.title) {
    this.role = this.title;
  }

  // Sync skills / requirements
  if (this.skills && this.skills.length > 0 && (!this.requirements || this.requirements.length === 0)) {
    this.requirements = this.skills;
  }
  if (this.requirements && this.requirements.length > 0 && (!this.skills || this.skills.length === 0)) {
    this.skills = this.requirements;
  }

  // Sync stipendOrCtc / salary
  if (this.stipendOrCtc && !this.salary) {
    this.salary = this.stipendOrCtc;
  }
  if (!this.stipendOrCtc && this.salary) {
    this.stipendOrCtc = this.salary;
  }
});

export const OpportunityModel = model<IOpportunity>("Opportunity", opportunitySchema);
export default OpportunityModel;
