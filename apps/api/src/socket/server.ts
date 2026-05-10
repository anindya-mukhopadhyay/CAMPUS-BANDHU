import type { Server as HttpServer } from "http";

import { Server } from "socket.io";

import { env } from "../config/env";
import { logger } from "../config/logger";

export function createSocketServer(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Socket connected");

    socket.on("subscribe", (channel: string) => {
      socket.join(channel);
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Socket disconnected");
    });
  });

  return io;
}
