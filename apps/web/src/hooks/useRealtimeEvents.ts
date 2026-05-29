"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { eventService } from "@/services";
import type { CampusEvent } from "@/types/domain";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8080";

export function useRealtimeEvents(): {
  events: CampusEvent[];
  loading: boolean;
  error: string | null;
} {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const response = await eventService.getAll();
        if (isMounted) {
          setEvents(response.data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to sync events feed");
          setLoading(false);
        }
      }
    };

    fetchEvents();

    // Establish direct socket.io-client listener
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true
    });

    socket.on("events:new", () => {
      fetchEvents();
    });

    socket.on("events:registration", () => {
      fetchEvents();
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, []);

  return { events, loading, error };
}
