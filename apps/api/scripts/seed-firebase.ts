import { firebaseAuth } from "../src/config/firebase-admin";

const profiles = [
  { uid: "demo-student-1", email: "alice@campus.edu", displayName: "Alice Sharma", password: "password123" },
  { uid: "demo-club-1", email: "techclub@campus.edu", displayName: "Tech Club Admin", password: "password123" },
  { uid: "demo-faculty-1", email: "vikram@campus.edu", displayName: "Dr. Vikram Singh", password: "password123" },
  { uid: "demo-recruiter-1", email: "sarah@globaltech.com", displayName: "Sarah Jenkins", password: "password123" },
  { uid: "demo-admin-1", email: "admin@campus.edu", displayName: "System Admin", password: "password123" }
];

async function seedFirebaseAuth() {
  console.log("Starting Firebase Auth Seed...");
  for (const profile of profiles) {
    try {
      await firebaseAuth.createUser({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        password: profile.password,
      });
      console.log(`Created user: ${profile.email}`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists' || error.code === 'auth/uid-already-exists') {
        console.log(`User already exists: ${profile.email}, updating password...`);
        await firebaseAuth.updateUser(profile.uid, { password: profile.password }).catch(() => {
          console.log(`Failed to update password for ${profile.email}`);
        });
      } else {
        console.error(`Error creating user ${profile.email}:`, error.message);
      }
    }
  }
  console.log("Firebase Auth Seed Complete!");
  process.exit(0);
}

seedFirebaseAuth();
