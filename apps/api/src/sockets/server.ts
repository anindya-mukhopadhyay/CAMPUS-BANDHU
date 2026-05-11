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

    socket.on("join", (room: string) => {
      socket.join(room);
      logger.info({ socketId: socket.id, room }, "Socket joined room");
    });

    socket.on("leave", (room: string) => {
      socket.leave(room);
      logger.info({ socketId: socket.id, room }, "Socket left room");
    });

    socket.on("chat:message", (data: { conversationId: string, content: string, senderId: string }) => {
      io.to(data.conversationId).emit("chat:message", data);
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Socket disconnected");
    });
  });


  return io;
}
