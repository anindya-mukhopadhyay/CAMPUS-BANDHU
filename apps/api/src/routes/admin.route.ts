import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth, requireRole } from "../middleware/auth";
import * as adminController from "../controllers/admin.controller";

export const adminRouter = Router();

// All admin routes require super_admin or college_admin role
adminRouter.use(requireAuth);
adminRouter.use(requireRole("super_admin", "college_admin"));

adminRouter.get(
  "/analytics",
  asyncHandler(adminController.getAnalytics)
);

adminRouter.post(
  "/moderate",
  asyncHandler(adminController.moderateUser)
);

adminRouter.post(
  "/announcement",
  asyncHandler(adminController.postAnnouncement)
);
