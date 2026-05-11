import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Tag, Image as ImageIcon, Users } from "lucide-react";
import { useEventStore } from "@/lib/stores/useEventStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { eventService } from "@/services";

export function CreateEventModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "Hackathon",
    maxAttendees: "",
    tags: "",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuthStore();
  const { addEvent } = useEventStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        maxAttendees: parseInt(formData.maxAttendees) || 100,
        tags: formData.tags.split(",").map(t => t.trim()),
        organizer: profile?.fullName || "Admin",
        featured: false
      };
      
      const response = await eventService.create(payload);
      addEvent(response.data);
      onClose();
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Create New Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Poster Upload (Mock) */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04]">
          <ImageIcon className="mb-2 h-8 w-8 text-slate" />
          <p className="text-sm font-medium text-white">Upload Event Poster</p>
          <p className="text-xs text-slate">PNG, JPG, or WEBP (Max 5MB)</p>
        </div>

        <Input 
          label="Event Title" 
          placeholder="Enter event name" 
          value={formData.title} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
          required 
        />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate">Description</label>
          <textarea
            required
            className="h-24 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            placeholder="What is this event about?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Date" 
            type="date" 
            icon={<Calendar className="h-4 w-4" />}
            value={formData.date} 
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
            required 
          />
          <Input 
            label="Time" 
            type="time" 
            icon={<Clock className="h-4 w-4" />}
            value={formData.time} 
            onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Location" 
            placeholder="Venue" 
            icon={<MapPin className="h-4 w-4" />}
            value={formData.location} 
            onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
            required 
          />
          <Input 
            label="Capacity" 
            type="number" 
            placeholder="Max attendees" 
            icon={<Users className="h-4 w-4" />}
            value={formData.maxAttendees} 
            onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })} 
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate">Category</label>
            <select
              className="w-full rounded-xl border border-white/10 bg-[#12121A] py-2.5 pl-3 pr-4 text-sm text-white focus:border-accent/50 focus:outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {["Hackathon", "Workshop", "Seminar", "Cultural", "Sports", "Career"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <Input 
            label="Tags (comma separated)" 
            placeholder="ai, coding, fun" 
            icon={<Tag className="h-4 w-4" />}
            value={formData.tags} 
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })} 
          />
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-accent to-electric py-3 text-sm font-semibold text-white shadow-glow-sm hover:shadow-neon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Publishing..." : "Publish Event"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
