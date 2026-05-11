"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, Users, Search, Clock, Plus,
  ArrowRight, Heart
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";

import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useEventStore } from "@/lib/stores/useEventStore";
import { eventService } from "@/services";
import { useEffect } from "react";

const categories = ["All", "Hackathon", "Workshop", "Seminar", "Cultural", "Sports", "Career"];

import { CreateEventModal } from "@/components/events/CreateEventModal";

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { role } = useAuthStore();
  const { events, setEvents, setIsLoading } = useEventStore();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await eventService.getAll();
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [setEvents, setIsLoading]);

  const filteredEvents = events.filter((e) => {
    const matchCategory = selectedCategory === "All" || e.category === selectedCategory;
    const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags.some((t) => t.includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const canCreateEvent = role === "organizer" || role === "super_admin" || role === "college_admin" || role === "faculty";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Event Discovery</h1>
            <p className="mt-1 text-sm text-slate">
              <AnimatedCounter value={events.length} /> upcoming events across campus
            </p>
          </div>
          <div className="flex gap-3">
            {canCreateEvent && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-electric px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm transition-shadow hover:shadow-neon"
              >
                <Plus className="h-4 w-4" /> Create Event
              </button>
            )}
          </div>
        </div>

        <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

        {/* Search + Filters */}
        <GlassCard padding="sm" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <input
              type="text"
              placeholder="Search events, tags, organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-slate hover:bg-white/[0.04] hover:text-white border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Featured Events */}
        {selectedCategory === "All" && !searchQuery && (
          <div className="grid gap-4 md:grid-cols-2">
            {events.filter(e => e.featured).map((event) => (
              <GlassCard key={event.id} glow="blue" className="group relative overflow-hidden">
                <div className="absolute inset-0 rounded-2xl">
                  <img src={event.image} alt={event.title} className="h-full w-full object-cover opacity-20 transition-opacity group-hover:opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-base via-base/80 to-transparent" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <NeonBadge color="blaze" size="sm" pulse>Featured</NeonBadge>
                    <NeonBadge color="blue" size="sm">{event.category}</NeonBadge>
                  </div>
                  <h3 className="font-heading text-xl font-bold">{event.title}</h3>
                  <p className="mt-2 text-sm text-slate line-clamp-2">{event.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {event.date}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {event.time}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {event.attendees}/{event.maxAttendees}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {event.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate">#{tag}</span>
                      ))}
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/25">
                      Register <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Event Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredEvents.filter(e => selectedCategory !== "All" || searchQuery || !e.featured).map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <GlassCard hover className="group h-full">
                  {/* Image */}
                  <div className="relative -mx-5 -mt-5 mb-4 h-36 overflow-hidden rounded-t-2xl">
                    <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-panel to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <NeonBadge color="blue" size="sm">{event.category}</NeonBadge>
                    </div>
                    <button className="absolute right-3 top-3 rounded-lg bg-black/40 p-1.5 text-white/60 backdrop-blur-sm transition-colors hover:text-rose">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="font-heading text-base font-semibold line-clamp-1">{event.title}</h3>
                  <p className="mt-1 text-xs text-slate line-clamp-2">{event.description}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.date}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate">
                      <span>{event.attendees} registered</span>
                      <span>{Math.round((event.attendees / event.maxAttendees) * 100)}% full</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-mint"
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      />
                    </div>
                  </div>

                  <Link href={`/events/${event.id}`} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] py-2 text-xs font-medium text-white transition-colors hover:bg-white/[0.08]">
                    View Details <ArrowRight className="h-3 w-3" />
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
