import { Schema, model, Types } from "mongoose";
import { schemaOptions } from "./schema-options";

export interface IEvent {
  _id?: string; // Add explicit _id type definition
  title: string;
  description: string;
  category: string;
  startAt?: Date;
  endAt?: Date;
  venue?: string;
  tags: string[];
  registrations: number;
  registeredStudentIds: string[];
  organizerId: string;
  organizerName?: string;
  imageUrl?: string;
  featured: boolean;

  // Compatibility fields
  date?: string;
  time?: string;
  location?: string;
  maxAttendees?: number;
  organizer?: string;
  image?: string;
  attendees?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    _id: { type: String, default: () => new Types.ObjectId().toString() },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "Hackathon" },
    startAt: { type: Date },
    endAt: { type: Date },
    venue: { type: String },
    tags: { type: [String], default: [] },
    registrations: { type: Number, default: 0 },
    registeredStudentIds: { type: [String], default: [] },
    organizerId: { type: String, required: true },
    organizerName: { type: String },
    imageUrl: { type: String },
    featured: { type: Boolean, default: false },

    // Compatibility fields
    date: { type: String },
    time: { type: String },
    location: { type: String },
    maxAttendees: { type: Number, default: 100 },
    organizer: { type: String },
    image: { type: String },
    attendees: { type: Number, default: 0 }
  },
  schemaOptions
);

// Compatibility synchronization hook
eventSchema.pre("save", function (this: any) {
  // Sync Dates
  if (this.startAt && !this.date) {
    this.date = this.startAt.toISOString();
  }
  if (!this.startAt && this.date) {
    this.startAt = new Date(this.date);
  }
  if (!this.endAt) {
    if (this.startAt) {
      // Default end time to 2 hours after start
      this.endAt = new Date(this.startAt.getTime() + 2 * 60 * 60 * 1000);
    } else {
      this.endAt = new Date();
    }
  }

  // Sync Venue / Location
  if (this.venue && !this.location) {
    this.location = this.venue;
  }
  if (!this.venue && this.location) {
    this.venue = this.location;
  }

  // Sync Image / ImageUrl
  if (this.imageUrl && !this.image) {
    this.image = this.imageUrl;
  }
  if (!this.imageUrl && this.image) {
    this.imageUrl = this.image;
  }

  // Sync Registrations / Attendees
  if (this.registrations !== undefined && this.attendees === 0) {
    this.attendees = this.registrations;
  }
  if (this.attendees !== undefined && this.registrations === 0) {
    this.registrations = this.attendees;
  }

  // Sync Organizer / OrganizerName
  if (this.organizer && !this.organizerName) {
    this.organizerName = this.organizer;
  }
  if (!this.organizer && this.organizerName) {
    this.organizer = this.organizerName;
  }
});

export const EventModel = model<IEvent>("Event", eventSchema);
export default EventModel;
