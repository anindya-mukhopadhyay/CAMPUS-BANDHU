import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { firebaseAuth } from "../config/firebase-admin";
import { UserModel } from "../models/user.model";

export async function requireAuth(request: Request, response: Response, next: NextFunction): Promise<void> {
  const header = request.headers.authorization;
  console.log("[requireAuth] Incoming request path:", request.path, "header:", header ? header.substring(0, 30) + "..." : "none");

  if (!header?.startsWith("Bearer ")) {
    console.log("[requireAuth] Missing or invalid bearer prefix");
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing bearer token" });
    return;
  }

  const token = header.split(" ")[1];
  if (!token) {
    console.log("[requireAuth] Token is empty after split");
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Missing bearer token" });
    return;
  }

  try {
    request.user = await firebaseAuth.verifyIdToken(token);
    console.log("[requireAuth] Firebase token verify success, request.user.uid:", request.user?.uid);
    next();
  } catch (err) {
    console.log("[requireAuth] Firebase verify failed, error:", err);
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
    console.log("[requireRole] request.user:", request.user, "userId:", userId, "allowedRoles:", allowedRoles);

    if (!userId) {
      console.log("[requireRole] Authentication required - userId is missing");
      response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
      return;
    }

    try {
      const userDoc = await UserModel.findOne({ uid: userId });
      const role = userDoc ? userDoc.role : "student";

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
