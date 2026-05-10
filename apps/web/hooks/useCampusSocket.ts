"use client";

import { useEffect, useState } from "react";

import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8080";

type Pulse = {
  event: string;
  receivedAt: string;
};

export function useCampusSocket(): Pulse[] {
  const [pulses, setPulses] = useState<Pulse[]>([]);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true
    });

    const events = [
      "events:new",
      "events:registration",
      "feed:new",
      "marketplace:new",
      "recruiters:new_opportunity",
      "achievements:minted"
    ];

    events.forEach((event) => {
      socket.on(event, () => {
        setPulses((current) => [{ event, receivedAt: new Date().toISOString() }, ...current].slice(0, 10));
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return pulses;
}
