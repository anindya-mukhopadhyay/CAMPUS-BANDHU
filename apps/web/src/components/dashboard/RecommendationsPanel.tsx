"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/api/client";
import { useCampusStore } from "@/lib/stores/useCampusStore";

type Recommendation = {
  id: string;
  title: string;
  score: number;
  reason: string;
  type: "event" | "club" | "opportunity";
};

export function RecommendationsPanel() {
  const selectedInterests = useCampusStore((state) => state.selectedInterests);
  const interestKey = useMemo(() => selectedInterests.sort().join(","), [selectedInterests]);

  const query = useQuery({
    queryKey: ["recommendations", interestKey],
    queryFn: () => apiRequest<{ data: Recommendation[] }>("/recommendations/personalized", "POST", { interests: selectedInterests })
  });

  const recommendations = query.data?.data ?? [];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-xl font-semibold">AI Match Engine</h3>
        <Badge>Personalized</Badge>
      </div>

      {query.isLoading ? <p className="text-sm text-slate">Computing semantic matches...</p> : null}
      {query.isError ? <p className="text-sm text-red-300">Unable to load recommendations.</p> : null}

      <div className="space-y-3">
        {recommendations.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-mint">{Math.round(item.score * 100)}% match</p>
            </div>
            <p className="mt-1 text-xs text-slate">{item.reason}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
