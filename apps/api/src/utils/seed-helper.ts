import UserModel from "../models/user.model";
import EventModel from "../models/event.model";
import ListingModel from "../models/listing.model";
import PostModel from "../models/post.model";
import OpportunityModel from "../models/opportunity.model";

export async function runDatabaseSeed(customUserId?: string, customUserDisplayName?: string) {
  // 1. Clear existing database collections (only demo entries to avoid wipe or complete wipe for seeding)
  // To make it simple and fully functional, we can wipe and rebuild, which is standard for local seeds.
  await Promise.all([
    UserModel.deleteMany({}),
    EventModel.deleteMany({}),
    ListingModel.deleteMany({}),
    PostModel.deleteMany({}),
    OpportunityModel.deleteMany({})
  ]);

  // 2. Profiles
  const profiles = [
    {
      uid: customUserId || "demo-student-1",
      email: "alice@campus.edu",
      fullName: customUserDisplayName || "Alice Sharma",
      department: "Computer Science",
      graduationYear: 2025,
      bio: "Passionate about AI and building decentralized systems.",
      interests: ["ai", "blockchain", "hackathon"],
      skills: ["React", "Node.js", "Python"],
      role: "student",
      status: "active"
    },
    {
      uid: "demo-club-1",
      email: "techclub@campus.edu",
      fullName: "Tech Club Admin",
      department: "Extracurriculars",
      graduationYear: 2025,
      bio: "Official account for the Campus Tech Club.",
      interests: ["networking", "hackathon"],
      skills: ["Event Management", "Leadership"],
      role: "organizer", // Standard organizer role
      status: "active"
    },
    {
      uid: "demo-faculty-1",
      email: "vikram@campus.edu",
      fullName: "Dr. Vikram Singh",
      department: "Electrical Engineering",
      graduationYear: 1998,
      bio: "Professor researching IoT and Smart Grids.",
      interests: ["research", "iot"],
      skills: ["MATLAB", "Embedded Systems"],
      role: "faculty",
      status: "active"
    },
    {
      uid: "demo-recruiter-1",
      email: "sarah@globaltech.com",
      fullName: "Sarah Jenkins",
      department: "Talent Acquisition",
      graduationYear: 2015,
      bio: "University recruiter at GlobalTech Inc.",
      interests: ["hiring", "networking"],
      skills: ["Recruitment", "Interviewing"],
      role: "recruiter",
      status: "active"
    },
    {
      uid: "demo-admin-1",
      email: "admin@campus.edu",
      fullName: "System Admin",
      department: "IT Services",
      graduationYear: 2020,
      bio: "Campus OS Administrator.",
      interests: ["infrastructure", "security"],
      skills: ["Kubernetes", "MongoDB", "SysAdmin"],
      role: "super_admin",
      status: "active"
    }
  ];

  await UserModel.create(profiles);

  // 3. Events
  const events = [
    {
      _id: "evt-hackathon-24",
      title: "Campus Hackathon 2024",
      description: "Annual 48-hour hackathon. Build the future of our campus!",
      startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      venue: "Main Auditorium",
      organizerId: "demo-club-1",
      organizerName: "Tech Club Admin",
      category: "hackathon",
      registrations: 150,
      tags: ["coding", "ai", "web3"],
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      featured: true
    },
    {
      _id: "evt-guest-lecture-1",
      title: "Guest Lecture: Future of IoT",
      description: "Join us for an insightful lecture by industry experts.",
      startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      venue: "Room 302, Block B",
      organizerId: "demo-faculty-1",
      organizerName: "Dr. Vikram Singh",
      category: "academic",
      registrations: 45,
      tags: ["iot", "research"],
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
      featured: true
    }
  ];

  await EventModel.create(events);

  // 4. Marketplace
  const items = [
    {
      _id: "item-macbook",
      title: "MacBook Pro M1 (2020)",
      description: "Excellent condition, used for 2 years. Includes charger.",
      price: 60000,
      sellerId: customUserId || "demo-student-1",
      sellerName: customUserDisplayName || "Alice Sharma",
      category: "electronics",
      condition: "Good",
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"
    },
    {
      _id: "item-textbook-cs",
      title: "Introduction to Algorithms",
      description: "3rd Edition. No highlighting.",
      price: 1500,
      sellerId: customUserId || "demo-student-1",
      sellerName: customUserDisplayName || "Alice Sharma",
      category: "books",
      condition: "Like New",
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80"
    }
  ];

  await ListingModel.create(items);

  // 5. Feed Posts
  const posts = [
    {
      _id: "post-1",
      content: "Just submitted my project for the upcoming hackathon! So excited 🚀",
      authorId: customUserId || "demo-student-1",
      authorName: customUserDisplayName || "Alice Sharma",
      authorRole: "student",
      likes: 12,
      comments: 2
    },
    {
      _id: "post-2",
      content: "GlobalTech is hiring! Come visit our booth at the placement cell tomorrow.",
      authorId: "demo-recruiter-1",
      authorName: "Sarah Jenkins",
      authorRole: "recruiter",
      likes: 35,
      comments: 8
    }
  ];

  await PostModel.create(posts);

  // 6. Recruiters/Jobs
  const jobs = [
    {
      _id: "job-sde-1",
      company: "GlobalTech Inc.",
      role: "Software Development Engineer I",
      description: "Looking for fresh graduates with strong fundamentals in DSA and Web Development.",
      skills: ["B.Tech CS/IT", "React", "Node.js"],
      stipendOrCtc: "12LPA - 15LPA",
      applyUrl: "https://globaltech.com/careers/sde-1",
      recruiterId: "demo-recruiter-1"
    }
  ];

  await OpportunityModel.create(jobs);
}
