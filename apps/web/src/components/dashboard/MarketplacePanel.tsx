"use client";

import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/api/client";
import type { MarketplaceListing } from "@/types/domain";

export function MarketplacePanel() {
  const query = useQuery({
    queryKey: ["marketplace"],
    queryFn: () => apiRequest<{ data: MarketplaceListing[] }>("/marketplace")
  });

  const listings = query.data?.data ?? [];

  return (
    <Card>
      <h3 className="mb-4 font-heading text-xl font-semibold">Campus Marketplace</h3>
      {query.isLoading ? <p className="text-sm text-slate">Loading marketplace inventory...</p> : null}
      <div className="space-y-3">
        {listings.slice(0, 3).map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm font-semibold text-blaze">₹{item.price.toLocaleString("en-IN")}</p>
            </div>
            <p className="mt-1 text-xs text-slate">
              {item.category} · {item.status}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
