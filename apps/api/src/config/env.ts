import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  AI_SERVICE_URL: z.string().url().default("http://localhost:8000"),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  JWT_AUDIENCE: z.string().default("campus-bandhu"),
  JWT_ISSUER: z.string().default("https://securetoken.google.com/campus-bandhu"),
  POLYGON_RPC_URL: z.string().default("https://polygon-rpc.com"),
  PRIVATE_KEY: z.string().optional(),
  ACHIEVEMENT_CONTRACT_ADDRESS: z.string().optional()
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
