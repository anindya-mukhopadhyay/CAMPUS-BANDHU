import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { firebaseAuth } from "../config/firebase-admin";
import { UserModel } from "../models/user.model";
import { apiOk } from "../utils/api-response";
import { HttpError } from "../utils/http-error";
import { generateUniqueUserId } from "../services/users.service";

export async function signup(request: Request, response: Response) {
  const { email, password, fullName, department, graduationYear, userId } = request.body;

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

  try {
    // 1. Create Firebase Auth User
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName: fullName,
    });

    // 2. Create User Profile in MongoDB
    const userProfile = await UserModel.create({
      uid: userRecord.uid,
      userId: finalUserId,
      email,
      fullName,
      department: department || "Undeclared",
      graduationYear: graduationYear || new Date().getFullYear() + 4,
      role: "student"
    });

    response.status(StatusCodes.CREATED).json(apiOk(userProfile.toJSON()));
  } catch (error: any) {
    throw new HttpError(StatusCodes.BAD_REQUEST, error.message || "Failed to create user");
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

  const userDoc = await UserModel.findOne({ uid: userId });
  
  if (!userDoc) {
    throw new HttpError(StatusCodes.NOT_FOUND, "User profile not found");
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
