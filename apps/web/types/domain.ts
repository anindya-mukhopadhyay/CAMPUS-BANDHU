export type CampusRole = "student" | "club" | "organizer" | "faculty" | "admin" | "recruiter";

export type CampusEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  startAt: string;
  endAt: string;
  venue: string;
  organizerId: string;
  registrations: number;
  tags: string[];
};

export type CampusPost = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
};

export type MarketplaceListing = {
  id: string;
  sellerId: string;
  title: string;
  price: number;
  category: string;
  status: "active" | "sold";
};

export type RecruiterCard = {
  id: string;
  company: string;
  role: string;
  skills: string[];
  stipendOrCtc: string;
};

export type Achievement = {
  id: string;
  studentId: string;
  title: string;
  eventId: string;
  tokenId?: string;
  txHash?: string;
  verified: boolean;
};
