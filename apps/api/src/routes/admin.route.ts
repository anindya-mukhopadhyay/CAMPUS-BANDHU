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

// All subsequent admin routes require authentication and super_admin or college_admin role
adminRouter.use(requireAuth);
adminRouter.use(requireRole("super_admin", "college_admin"));

adminRouter.get(
  "/analytics",
  asyncHandler(adminController.getAnalytics)
);

adminRouter.get(
  "/users",
  asyncHandler(adminController.listUsers)
);

adminRouter.post(
  "/moderate",
  asyncHandler(adminController.moderateUser)
);

adminRouter.post(
  "/announcement",
  asyncHandler(adminController.postAnnouncement)
);

adminRouter.get(
  "/colleges",
  asyncHandler(adminController.listColleges)
);

adminRouter.post(
  "/colleges",
  asyncHandler(adminController.createCollege)
);

adminRouter.post(
  "/colleges/moderate",
  asyncHandler(adminController.moderateCollege)
);

adminRouter.get(
  "/events/pending",
  asyncHandler(adminController.listPendingEvents)
);

adminRouter.post(
  "/events/moderate",
  asyncHandler(adminController.moderateEvent)
);

adminRouter.get(
  "/settings",
  asyncHandler(adminController.getSettings)
);

adminRouter.post(
  "/settings",
  asyncHandler(adminController.updateSettings)
);

adminRouter.get(
  "/audit-logs",
  asyncHandler(adminController.listAuditLogs)
);

adminRouter.get(
  "/departments",
  asyncHandler(adminController.listDepartments)
);

adminRouter.post(
  "/departments",
  asyncHandler(adminController.createDepartment)
);

adminRouter.get(
  "/clubs",
  asyncHandler(adminController.listClubs)
);

adminRouter.post(
  "/clubs",
  asyncHandler(adminController.createClub)
);

adminRouter.post(
  "/clubs/moderate",
  asyncHandler(adminController.moderateClub)
);

adminRouter.get(
  "/events",
  asyncHandler(adminController.listCampusEvents)
);
