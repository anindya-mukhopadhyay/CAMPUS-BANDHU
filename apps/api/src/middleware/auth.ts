import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { firebaseAuth } from "../config/firebase-admin";
import { firestore } from "../config/firebase-admin";

export async function requireAuth(request: Request, response: Response, next: NextFunction): Promise<void> {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing bearer token" });
    return;
  }

  const token = header.split(" ")[1];
  if (!token) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing bearer token" });
    return;
  }

  // Development-only: Allow mock token for easier testing
  if (process.env.NODE_ENV === "development" && token === "mock-token") {
    request.user = {
      uid: "mock-uid",
      email: "mock@example.com",
      role: "student",
    } as any;
    return next();
  }

  try {
    request.user = await firebaseAuth.verifyIdToken(token, true);
    next();
  } catch {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired token" });
  }
}

/**
 * Role-based access control middleware.
 * Must be used AFTER requireAuth.
 */
export function requireRole(...allowedRoles: string[]) {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const userId = request.user?.uid;

    if (!userId) {
      response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
      return;
    }

    try {
      const profileDoc = await firestore.collection("users").doc(userId).get();
      const role = profileDoc.exists ? (profileDoc.data()?.role as string) : "student";

      if (!allowedRoles.includes(role)) {
        response.status(StatusCodes.FORBIDDEN).json({
          message: `Access denied. Required role: ${allowedRoles.join(" | ")}. Your role: ${role}`
        });
        return;
      }

      // Attach role to request for downstream use
      (request as any).userRole = role;
      next();
    } catch {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to verify role" });
    }
  };
}
