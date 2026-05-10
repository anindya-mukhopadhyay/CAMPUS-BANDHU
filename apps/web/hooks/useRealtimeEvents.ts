"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase/client";
import type { CampusEvent } from "@/types/domain";

export function useRealtimeEvents(): {
  events: CampusEvent[];
  loading: boolean;
  error: string | null;
} {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("startAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<CampusEvent, "id">) }));
        setEvents(next);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { events, loading, error };
}
