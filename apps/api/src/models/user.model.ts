import { Schema, model } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IUser {
  uid: string;
  email: string;
  fullName: string;
  department: string;
  graduationYear: number;
  bio: string;
  interests: string[];
  skills: string[];
  role: string;
  status: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  avatarZoom?: number;
  avatarX?: number;
  avatarY?: number;
  coverZoom?: number;
  coverY?: number;
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
  skillLevels?: Record<string, number>;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true },
    fullName: { type: String, required: true },
    department: { type: String, default: "Undeclared" },
    graduationYear: { type: Number, default: () => new Date().getFullYear() + 4 },
    bio: { type: String, default: "" },
    interests: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    role: { type: String, default: "student" },
    status: { type: String, default: "active" },
    avatarUrl: { type: String },
    coverPhotoUrl: { type: String },
    avatarZoom: { type: Number, default: 1 },
    avatarX: { type: Number, default: 0 },
    avatarY: { type: Number, default: 0 },
    coverZoom: { type: Number, default: 1 },
    coverY: { type: Number, default: 50 },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    resumeUrl: { type: String },
    collegeId: { type: String },
    collegeName: { type: String },
    gender: { type: String, default: "Undeclared" },
    leetcodeUrl: { type: String },
    orcidUrl: { type: String },
    projects: {
      type: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
          photoUrl: { type: String },
          youtubeLink: { type: String },
          githubLink: { type: String }
        }
      ],
      default: []
    },
    experience: {
      type: [
        {
          role: { type: String, required: true },
          company: { type: String, required: true },
          duration: { type: String, required: true },
          description: { type: String }
        }
      ],
      default: []
    },
    licenses: {
      type: [
        {
          name: { type: String, required: true },
          issuer: { type: String, required: true },
          issueDate: { type: String },
          credentialUrl: { type: String }
        }
      ],
      default: []
    },
    skillLevels: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  schemaOptions
);

export const UserModel = model<IUser>("User", userSchema);
export default UserModel;
