import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getMessaging, isSupported as messagingSupported } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC5i0_HHWNxLyMX6gabk8tbzK9GWyK4eQY",
  authDomain: "campus-bandhu.firebaseapp.com",
  projectId: "campus-bandhu",
  storageBucket: "campus-bandhu.firebasestorage.app",
  messagingSenderId: "344034026401",
  appId: "1:344034026401:web:4b1882f65ceb9161f0a1e0",
  measurementId: "G-KK6791WGV2"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with better cache settings and explicit database ID
export const db = getFirestore(app, "default");

// Enable offline persistence
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === "unimplemented") {
      console.warn("The current browser does not support all of the features required to enable persistence");
    }
  });
}

export const storage = getStorage(app);

export async function initAnalytics(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (await analyticsSupported()) {
    getAnalytics(app);
  }
}

export async function initMessaging() {
  if (typeof window === "undefined") {
    return null;
  }

  if (await messagingSupported()) {
    return getMessaging(app);
  }

  return null;
}
