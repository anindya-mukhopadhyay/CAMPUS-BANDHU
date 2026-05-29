import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { achievementsRouter } from "./routes/achievements.route";
import { eventsRouter } from "./routes/events.route";
import { feedRouter } from "./routes/feed.route";
import { healthRouter } from "./routes/health.route";
import { marketplaceRouter } from "./routes/marketplace.route";
import { usersRouter } from "./routes/users.route";
import { recruitersRouter } from "./routes/recruiters.route";
import { recommendationsRouter } from "./routes/recommendations.route";
import { authRouter } from "./routes/auth.route";
import { chatRouter } from "./routes/chat.route";
import { adminRouter } from "./routes/admin.route";
import { teamsRouter } from "./routes/teams.route";

export function createApp(): express.Express {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 200,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { success: false, message: "Rate limit exceeded" }
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use((request, _response, next) => {
    logger.info({ method: request.method, path: request.path }, "Incoming request");
    next();
  });

  app.use("/api/v1", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1", eventsRouter);
  app.use("/api/v1", feedRouter);
  app.use("/api/v1", marketplaceRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/chat", chatRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/teams", teamsRouter);
  app.use("/api/v1", recruitersRouter);
  app.use("/api/v1", recommendationsRouter);
  app.use("/api/v1", achievementsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
