import mongoose from "mongoose";
import { env } from "../src/config/env";
import { runDatabaseSeed } from "../src/utils/seed-helper";

const seedData = async () => {
  console.log("🌱 Starting MongoDB seed...");
  
  // 1. Establish mongoose connection
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  console.log("🔌 Connected to MongoDB for seeding.");

  // 2. Run seed helper
  await runDatabaseSeed();
  
  console.log("🎉 Seeding complete!");
  
  // 3. Disconnect
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB.");
  process.exit(0);
};

seedData().catch(async (err) => {
  console.error("❌ Seeding failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
