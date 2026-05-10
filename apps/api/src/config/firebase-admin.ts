import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { env } from "./env";

const existing = getApps()[0];

const firebaseApp =
  existing ??
  initializeApp(
    env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY
      ? {
          credential: cert({
            projectId: "campus-bandhu",
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          })
        }
      : {
          projectId: "campus-bandhu"
        }
  );

export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
