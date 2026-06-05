import { firebaseAuth } from "../src/config/firebase-admin";

async function createAdmin() {
  try {
    const email = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || "superadmin@gmail.com";
    const password = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || "1234567890";
    
    console.log(`Creating Firebase Auth user for ${email}...`);
    
    try {
      const user = await firebaseAuth.createUser({
        email,
        password,
        displayName: "System Admin",
      });
      console.log(`Successfully created new user: ${user.uid}`);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`User ${email} already exists in Firebase. Updating password just in case...`);
        const user = await firebaseAuth.getUserByEmail(email);
        await firebaseAuth.updateUser(user.uid, { password });
        console.log(`Password updated for ${user.uid}`);
      } else {
        throw err;
      }
    }
    
    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
