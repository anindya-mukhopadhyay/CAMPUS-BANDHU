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

  // Development-only: Allow mock token for easier testing
  if (process.env.NODE_ENV === "development" && token.startsWith("mock-token")) {
    const parts = token.split("-");
    const role = parts[2] || "student";
    const uid = parts[3] || "mock-uid";
    request.user = {
      uid,
      email: `${role}@example.com`,
      role,
    } as any;
    console.log("[requireAuth] Mock token match, request.user set:", request.user);
    return next();
  }

  try {
    request.user = await firebaseAuth.verifyIdToken(token, true);
    console.log("[requireAuth] Firebase token verify success, request.user.uid:", request.user?.uid);
    next();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      try {
        const payloadPart = token.split(".")[1];
        if (payloadPart) {
          const decoded = JSON.parse(Buffer.from(payloadPart, "base64").toString("utf-8"));
          request.user = {
            uid: decoded.uid || decoded.sub || "mock-uid",
            email: decoded.email || "mock@example.com",
            role: decoded.role || "student"
          } as any;
          console.log("[requireAuth] Dev catch block fallback, request.user set:", request.user);
          return next();
        }
      } catch (decodeErr) {
        // Fall through to normal error
      }
    }
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
      const isMock = process.env.NODE_ENV === "development" && request.headers.authorization?.includes("mock-token");
      let role = "student";
      
      if (isMock) {
        role = (request.user as any)?.role || "student";
      } else {
        const userDoc = await UserModel.findOne({ uid: userId });
        role = userDoc ? userDoc.role : "student";
      }

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
