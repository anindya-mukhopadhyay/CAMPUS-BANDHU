import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, type User } from "firebase/auth";

import { auth } from "@/lib/firebase/client";

const MOCK_AUTH_STORAGE_KEY = "campus-bandhu:mock-auth";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function loginWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
  }
  await signOut(auth);
}

export function subscribeAuth(listener: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, listener);
}
