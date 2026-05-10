import { AssistantComposer } from "@/components/assistant/AssistantComposer";
import { EventsPanel } from "@/components/dashboard/EventsPanel";
import { MarketplacePanel } from "@/components/dashboard/MarketplacePanel";
import { NetworkPanel } from "@/components/dashboard/NetworkPanel";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import { RealtimePulse } from "@/components/dashboard/RealtimePulse";
import { AppShell } from "@/components/layout/AppShell";
import { HeroSection } from "@/components/sections/HeroSection";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <HeroSection />
        <RealtimePulse />

        <div className="grid gap-6 xl:grid-cols-2">
          <EventsPanel />
          <RecommendationsPanel />
          <NetworkPanel />
          <MarketplacePanel />
          <div className="xl:col-span-2">
            <AssistantComposer />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
