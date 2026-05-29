import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth, requireRole } from "../middleware/auth";
import * as adminController from "../controllers/admin.controller";

export const adminRouter = Router();

// Seeding endpoint requires only authentication (so a new user can seed their own admin profile)
adminRouter.post(
  "/seed",
  requireAuth,
  asyncHandler(adminController.seedDatabase)
);

// All subsequent admin routes require super_admin or college_admin role
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
