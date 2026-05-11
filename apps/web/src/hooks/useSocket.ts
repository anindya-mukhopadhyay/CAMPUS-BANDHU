import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../lib/stores/useAuthStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"]
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to realtime server");
      // Join user-specific room for private notifications/messages
      socket.emit("join", `user:${user.uid}`);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback: (data: any) => void) => {
    socketRef.current?.off(event, callback);
  };

  return { emit, on, off, socket: socketRef.current };
}
