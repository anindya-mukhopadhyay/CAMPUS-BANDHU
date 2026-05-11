import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { firestore, firebaseAuth } from "../config/firebase-admin";
import { apiOk } from "../utils/api-response";
import { HttpError } from "../utils/http-error";

export async function signup(request: Request, response: Response) {
  const { email, password, fullName, department, graduationYear } = request.body;

  if (!email || !password || !fullName) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Missing required fields");
  }

  try {
    // 1. Create Firebase Auth User
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName: fullName,
    });

    // 2. Create User Profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      fullName,
      department: department || "Undeclared",
      graduationYear: graduationYear || new Date().getFullYear() + 4,
      role: "student",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firestore.collection("users").doc(userRecord.uid).set(userProfile);

    response.status(StatusCodes.CREATED).json(apiOk(userProfile));
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

  const userDoc = await firestore.collection("users").doc(userId).get();
  
  if (!userDoc.exists) {
    throw new HttpError(StatusCodes.NOT_FOUND, "User profile not found");
  }

  response.json(apiOk(userDoc.data()));
}

export async function verifyRole(request: Request, response: Response) {
  const role = (request as any).userRole;
  response.json(apiOk({ role }));
}
