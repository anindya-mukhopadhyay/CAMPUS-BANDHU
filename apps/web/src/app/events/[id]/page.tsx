"use client";

import { use, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { useEventStore } from "@/lib/stores/useEventStore";
import { Calendar, MapPin, Clock, Heart, Share2, MessageSquare, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { events, registerForEvent } = useEventStore();
  const event = events.find(e => e.id === resolvedParams.id);
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReminded, setIsReminded] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "Alice S.", text: "Can't wait for this! Do we need to bring laptops?", time: "2 hours ago" },
    { id: 2, user: "Rahul M.", text: "Yes, they mentioned it in the discord.", time: "1 hour ago" }
  ]);

  if (!event) return <AppShell><div className="p-8 text-center text-slate">Event not found.</div></AppShell>;

  const isFull = event.attendees >= event.maxAttendees;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments([{ id: Date.now(), user: "You", text: comment, time: "Just now" }, ...comments]);
    setComment("");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Hero Poster */}
        <div className="relative h-[400px] w-full overflow-hidden rounded-3xl">
          <img src={event.image} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <NeonBadge color="blue" size="md" className="mb-4">{event.category}</NeonBadge>
              <h1 className="font-heading text-4xl font-bold text-white shadow-black drop-shadow-md">{event.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-white/80">
                Organized by <span className="font-semibold text-white">{event.organizer}</span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setIsReminded(!isReminded)} className={`flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-md transition-all ${isReminded ? 'bg-mint/20 text-mint border border-mint/50' : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'}`}>
                <Bell className="h-5 w-5" />
              </button>
              <button onClick={() => setIsBookmarked(!isBookmarked)} className={`flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-md transition-all ${isBookmarked ? 'bg-rose/20 text-rose border border-rose/50' : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'}`}>
                <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-rose' : ''}`} />
              </button>
              <button onClick={handleShare} className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 text-white/80 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            <GlassCard>
              <h2 className="font-heading text-xl font-bold mb-4">About this Event</h2>
              <p className="text-slate leading-relaxed">{event.description}</p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="rounded-lg bg-white/[0.04] px-3 py-1 text-xs text-slate">#{tag}</span>
                ))}
              </div>
            </GlassCard>

            {/* Comments Section */}
            <GlassCard>
              <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-accent" /> Discussion
              </h2>
              
              <form onSubmit={handleComment} className="flex gap-3 mb-6">
                <Avatar name="You" size="md" />
                <div className="flex-1 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white focus:border-accent/50 focus:outline-none"
                  />
                  <button type="submit" disabled={!comment.trim()} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
                    Post
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={c.user} size="md" />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">{c.user}</span>
                        <span className="text-[10px] text-slate">{c.time}</span>
                      </div>
                      <p className="text-sm text-slate/90 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sticky Sidebar */}
          <div className="space-y-6">
            <GlassCard className="sticky top-24">
              <h3 className="font-heading text-lg font-bold mb-4">Event Info</h3>
              
              <div className="space-y-4 text-sm text-slate mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{event.location}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate mb-2">
                  <span>Capacity</span>
                  <span className="font-semibold text-white">{event.attendees} / {event.maxAttendees}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div 
                    className={`h-full rounded-full transition-all ${isFull ? 'bg-rose' : 'bg-gradient-to-r from-accent to-mint'}`}
                    style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                  />
                </div>
              </div>

              <button 
                onClick={() => registerForEvent(event.id)}
                disabled={isFull}
                className="w-full rounded-xl bg-gradient-to-r from-accent to-electric py-3 text-sm font-bold text-white shadow-glow-sm hover:shadow-neon disabled:opacity-50 disabled:grayscale"
              >
                {isFull ? "Event Full" : "Register Now"}
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
