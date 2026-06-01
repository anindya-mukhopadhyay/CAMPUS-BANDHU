import { Router } from "express";

import { apiOk } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import UserModel from "../models/user.model";
import EventModel from "../models/event.model";

export const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.json(
    apiOk({
      service: "campus-bandhu-api",
      status: "ok"
    })
  );
});

healthRouter.get("/system-pulse", asyncHandler(async (_request, response) => {
  const [events, online, recruiters] = await Promise.all([
    EventModel.countDocuments({ status: "active" }),
    UserModel.countDocuments({ status: "active" }),
    UserModel.countDocuments({ role: "recruiter" })
  ]);

  response.json(
    apiOk({
      events: events || 0,
      online: online || 0,
      recruiters: recruiters || 0
    })
  );
}));
