"use client";

import { Activity } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useCampusSocket } from "@/hooks/useCampusSocket";

export function RealtimePulse() {
  const pulses = useCampusSocket();

  return (
    <Card className="border-mint/30 bg-mint/5">
      <div className="flex items-center justify-between">
        <p className="font-heading text-lg font-semibold">Realtime Campus Pulse</p>
        <Activity className="h-5 w-5 text-mint" />
      </div>

      {pulses.length === 0 ? (
        <p className="mt-2 text-sm text-slate">Waiting for live activity events...</p>
      ) : (
        <div className="mt-2 space-y-2">
          {pulses.slice(0, 4).map((pulse, index) => (
            <p key={`${pulse.event}-${pulse.receivedAt}-${index}`} className="text-sm text-slate">
              {pulse.event} · {new Date(pulse.receivedAt).toLocaleTimeString()}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
