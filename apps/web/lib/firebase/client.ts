import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
export const db = getFirestore(app);
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
