import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { firebaseAuth } from "../config/firebase-admin";
import { UserModel } from "../models/user.model";
import { apiOk } from "../utils/api-response";
import { HttpError } from "../utils/http-error";
import { generateUniqueUserId } from "../services/users.service";
import { logger } from "../config/logger";

export async function signup(request: Request, response: Response) {
  const { email, password, fullName, department, graduationYear, userId, role } = request.body;

  if (!email || !password || !fullName) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Missing required fields");
  }

  // Validate user ID if provided
  let finalUserId = userId;
  if (finalUserId) {
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(finalUserId)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, "User ID must be 3-30 alphanumeric characters or underscores");
    }
    const existing = await UserModel.findOne({ userId: finalUserId });
    if (existing) {
      throw new HttpError(StatusCodes.BAD_REQUEST, "User ID is already taken");
    }
  } else {
    finalUserId = await generateUniqueUserId(fullName || "user");
  }

  const allowedRoles = ["student", "recruiter", "college_admin", "super_admin", "faculty"];
  const finalRole = allowedRoles.includes(role) ? role : "student";
  const finalStatus = ["recruiter", "college_admin", "super_admin", "faculty"].includes(finalRole) ? "pending" : "active";

  let uid: string;
  let isExistingFirebaseUser = false;

  try {
    // 1. Create Firebase Auth User
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName: fullName,
    });
    uid = userRecord.uid;
  } catch (firebaseError: any) {
    if (firebaseError.code === "auth/email-already-in-use") {
      try {
        const existingRecord = await firebaseAuth.getUserByEmail(email);
        const existingMongoUser = await UserModel.findOne({ uid: existingRecord.uid });
        if (!existingMongoUser) {
          uid = existingRecord.uid;
          isExistingFirebaseUser = true;
          logger.info({ uid, email }, "Signup request for existing Firebase user with missing MongoDB profile. Restoring.");
        } else {
          throw new HttpError(StatusCodes.BAD_REQUEST, "An account with this email already exists");
        }
      } catch (err: any) {
        throw new HttpError(StatusCodes.BAD_REQUEST, err.message || "Email already in use");
      }
    } else {
      throw new HttpError(StatusCodes.BAD_REQUEST, firebaseError.message || "Failed to create Firebase user");
    }
  }

  try {
    // 2. Create User Profile in MongoDB
    const userProfile = await UserModel.create({
      uid,
      userId: finalUserId,
      email,
      fullName,
      department: department || "Undeclared",
      graduationYear: graduationYear || new Date().getFullYear() + 4,
      role: finalRole,
      status: finalStatus
    });

    response.status(isExistingFirebaseUser ? StatusCodes.OK : StatusCodes.CREATED).json(apiOk(userProfile.toJSON()));
  } catch (error: any) {
    throw new HttpError(StatusCodes.BAD_REQUEST, error.message || "Failed to create user profile");
  }
}

export async function login(request: Request, response: Response) {
  // Login is usually handled by Firebase Client SDK, which returns an ID Token.
  // The backend verifies this token in the middleware.
  // This endpoint can be used to return the user profile after token verification.
  const userId = (request as any).user?.uid;
  
  if (!userId) {
    throw new HttpError(StatusCodes.UNAUTHORIZED, "User not authenticated");
  }

  let userDoc = await UserModel.findOne({ uid: userId });
  
  if (!userDoc) {
    logger.info({ uid: userId }, "User profile missing in MongoDB. Attempting auto-restore from Firebase Auth.");
    try {
      const firebaseUser = await firebaseAuth.getUser(userId);
      const email = firebaseUser.email || `${userId.substring(0, 8)}@campus.edu`;
      const fullName = firebaseUser.displayName || "Restored User";
      
      // Infer role
      let role = "student";
      if (email.includes("admin") || email === (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || "superadmin@gmail.com")) {
        role = "super_admin";
      } else if (email.includes("recruiter")) {
        role = "recruiter";
      } else if (email.includes("faculty")) {
        role = "faculty";
      }
      
      const status = ["student"].includes(role) ? "active" : "pending";

      userDoc = await UserModel.create({
        uid: userId,
        email,
        fullName,
        department: "Undeclared",
        graduationYear: new Date().getFullYear() + 4,
        role,
        status
      });
      logger.info({ uid: userId, email, role }, "Restored missing user profile successfully");
    } catch (err) {
      logger.error({ uid: userId, err }, "Failed to auto-restore missing user profile");
      throw new HttpError(StatusCodes.NOT_FOUND, "User profile not found and could not be restored");
    }
  }

  // Populate legacy/Google users with a unique userId if they don't have one
  if (!userDoc.userId) {
    userDoc.userId = await generateUniqueUserId(userDoc.fullName || userDoc.email.split("@")[0] || "user");
    await userDoc.save();
  }

  response.json(apiOk(userDoc.toJSON()));
}

export async function verifyRole(request: Request, response: Response) {
  const role = (request as any).userRole;
  response.json(apiOk({ role }));
}
