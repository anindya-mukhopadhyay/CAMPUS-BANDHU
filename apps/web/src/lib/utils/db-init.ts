import { db } from "../firebase/client";
import { doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";

const collections = [
  "users", "events", "registrations", "marketplace", "marketplaceChats",
  "chats", "notifications", "certificates", "analytics", "aiRecommendations",
  "attendanceLogs", "blockchainProofs", "recruiterPosts", "achievements",
  "clubs", "reviews", "reports", "leaderboards"
];

/**
 * Initializes all Firestore collections by creating a temporary document in each
 * and then immediately deleting it. This ensures the collections exist in the 
 * Firestore console for easier management.
 */
export async function initializeCollections() {
  console.log("🚀 Initializing Firestore collections...");
  
  for (const collectionName of collections) {
    try {
      const tempDocRef = doc(db, collectionName, "_temp_init_");
      
      // We set a dummy field just to trigger the collection creation
      await setDoc(tempDocRef, {
        _initializedAt: Timestamp.now(),
        _note: "This document was created to initialize the collection and can be deleted."
      });
      
      // Immediately delete it to keep things clean
      await deleteDoc(tempDocRef);
      
      console.log(`✅ Collection "${collectionName}" initialized.`);
    } catch (error) {
      console.error(`❌ Failed to initialize collection "${collectionName}":`, error);
    }
  }
  
  console.log("✨ All collections initialized!");
}
