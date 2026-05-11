import { create } from "zustand";

export type EventData = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  organizer: string;
  image: string;
  tags: string[];
  featured: boolean;
};

type EventState = {
  events: EventData[];
  isLoading: boolean;
  setEvents: (events: EventData[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  addEvent: (event: Omit<EventData, "id" | "attendees">) => void;
  registerForEvent: (id: string) => void;
};

// Initial mock data
const initialEvents: EventData[] = [
  {
    id: "1", title: "Campus Hackathon 2024", description: "48-hour innovation sprint. Build the future of campus life.", date: "2024-05-18", time: "10:00 AM",
    location: "Main Auditorium", category: "Hackathon", attendees: 248, maxAttendees: 300, organizer: "Tech Club",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    tags: ["coding", "ai", "web3"], featured: true
  },
  {
    id: "2", title: "AI & Machine Learning Workshop", description: "Hands-on workshop on neural networks and deep learning fundamentals.", date: "2024-05-15", time: "2:00 PM",
    location: "Lab 302, Block B", category: "Workshop", attendees: 45, maxAttendees: 60, organizer: "AI Society",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    tags: ["ml", "python", "research"], featured: true
  }
];

export const useEventStore = create<EventState>((set) => ({
  events: initialEvents,
  isLoading: false,
  
  setEvents: (events) => set({ events }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  addEvent: (eventData) => set((state) => {
    const newEvent: EventData = {
      ...eventData,
      id: Math.random().toString(36).substring(7),
      attendees: 0,
    };
    return { events: [newEvent, ...state.events] };
  }),

  registerForEvent: (id) => set((state) => ({
    events: state.events.map(event => 
      event.id === id ? { ...event, attendees: Math.min(event.attendees + 1, event.maxAttendees) } : event
    )
  }))
}));
