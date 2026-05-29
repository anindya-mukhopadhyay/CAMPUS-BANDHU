import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { apiOk } from "../utils/api-response";
import * as teamService from "../services/teams.service";
import UserModel from "../models/user.model";

export async function getTeams(_request: Request, response: Response) {
  const data = await teamService.getAllTeams();
  response.json(apiOk(data));
}

export async function createTeam(request: Request, response: Response) {
  const userId = (request as any).user?.uid;
  if (!userId) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
    return;
  }

  // Fetch creator's full name
  const user = await UserModel.findOne({ uid: userId });
  const creatorName = user?.fullName || "Team Lead";

  const data = await teamService.createTeam(userId, creatorName, request.body);
  response.json(apiOk(data));
}

export async function requestToJoin(request: Request, response: Response) {
  const userId = (request as any).user?.uid;
  if (!userId) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
    return;
  }

  const { id } = request.params;
  try {
    const data = await teamService.requestToJoin(id as string, userId);
    response.json(apiOk(data));
  } catch (err: any) {
    response.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
}

export async function acceptRequest(request: Request, response: Response) {
  const userId = (request as any).user?.uid;
  if (!userId) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
    return;
  }

  const { id } = request.params;
  const { requesterId } = request.body;
  if (!requesterId) {
    response.status(StatusCodes.BAD_REQUEST).json({ message: "requesterId is required" });
    return;
  }

  try {
    const data = await teamService.acceptJoinRequest(id as string, userId, requesterId);
    response.json(apiOk(data));
  } catch (err: any) {
    response.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
}

export async function rejectRequest(request: Request, response: Response) {
  const userId = (request as any).user?.uid;
  if (!userId) {
    response.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
    return;
  }

  const { id } = request.params;
  const { requesterId } = request.body;
  if (!requesterId) {
    response.status(StatusCodes.BAD_REQUEST).json({ message: "requesterId is required" });
    return;
  }

  try {
    const data = await teamService.rejectJoinRequest(id as string, userId, requesterId);
    response.json(apiOk(data));
  } catch (err: any) {
    response.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
}
