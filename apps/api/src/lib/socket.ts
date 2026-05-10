import type { Request } from "express";
import type { Server } from "socket.io";

export function emitRealtime(request: Request, event: string, payload: Record<string, unknown>): void {
  const io = request.app.get("io") as Server | undefined;
  io?.emit(event, payload);
}
