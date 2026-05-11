import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { apiOk } from "../utils/api-response";
import * as userService from "../services/users.service";

export async function getProfile(request: Request, response: Response) {
  const userId = request.params.id || (request as any).user?.uid;
  if (!userId) {
    response.status(StatusCodes.BAD_REQUEST).json({ message: "User ID required" });
    return;
  }
  const data = await userService.getProfileById(userId);
  response.json(apiOk(data));
}

export async function updateProfile(request: Request, response: Response) {
  const userId = (request as any).user?.uid;
  if (!userId) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
    return;
  }
  const data = await userService.updateProfile(userId, request.body);
  response.json(apiOk(data));
}

export async function addSkill(request: Request, response: Response) {
  const userId = (request as any).user?.uid;
  if (!userId) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
    return;
  }
  const { skill } = request.body;
  const data = await userService.addSkill(userId, skill);
  response.json(apiOk(data));
}
