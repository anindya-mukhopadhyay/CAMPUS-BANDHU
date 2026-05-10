"use client";

import { Calendar, MapPin, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

export function EventsPanel() {
  const { events, loading, error } = useRealtimeEvents();

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-xl font-semibold">Live Events Radar</h3>
        <span className="text-xs text-accent">Realtime</span>
      </div>

      {loading ? <p className="text-sm text-slate">Syncing events feed...</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="space-y-3">
        {events.slice(0, 4).map((event) => (
          <div key={event.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="font-semibold">{event.title}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(event.startAt).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.venue}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {event.registrations} joined
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
