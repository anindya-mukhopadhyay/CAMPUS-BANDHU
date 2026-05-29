import mongoose from "mongoose";

import { env } from "./env";
import { logger } from "./logger";

export async function connectDatabase(): Promise<void> {
  try {
    logger.info("Connecting to MongoDB database...");
    
    // Set mongoose options
    mongoose.set("strictQuery", true);
    
    await mongoose.connect(env.MONGO_URI);
    
    logger.info("Connected to MongoDB database successfully");
  } catch (error) {
    logger.error({ error }, "Failed to connect to MongoDB");
    process.exit(1);
  }
}
