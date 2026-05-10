import { firestore } from "../src/config/firebase-admin";
import { env } from "../src/config/env";

const seedData = async () => {
  console.log("🌱 Starting Firestore seed...");

  // 1. Profiles
  const profiles = [
    {
      id: "demo-student-1",
      fullName: "Alice Sharma",
      department: "Computer Science",
      graduationYear: 2025,
      bio: "Passionate about AI and building decentralized systems.",
      interests: ["ai", "blockchain", "hackathon"],
      skills: ["React", "Node.js", "Python"],
      role: "student",
      updatedAt: new Date().toISOString()
    },
    {
      id: "demo-club-1",
      fullName: "Tech Club Admin",
      department: "Extracurriculars",
      graduationYear: 2025,
      bio: "Official account for the Campus Tech Club.",
      interests: ["networking", "hackathon"],
      skills: ["Event Management", "Leadership"],
      role: "club_organizer",
      updatedAt: new Date().toISOString()
    },
    {
      id: "demo-faculty-1",
      fullName: "Dr. Vikram Singh",
      department: "Electrical Engineering",
      graduationYear: 1998,
      bio: "Professor researching IoT and Smart Grids.",
      interests: ["research", "iot"],
      skills: ["MATLAB", "Embedded Systems"],
      role: "faculty",
      updatedAt: new Date().toISOString()
    },
    {
      id: "demo-recruiter-1",
      fullName: "Sarah Jenkins",
      department: "Talent Acquisition",
      graduationYear: 2015,
      bio: "University recruiter at GlobalTech Inc.",
      interests: ["hiring", "networking"],
      skills: ["Recruitment", "Interviewing"],
      role: "recruiter",
      updatedAt: new Date().toISOString()
    },
    {
      id: "demo-admin-1",
      fullName: "System Admin",
      department: "IT Services",
      graduationYear: 2020,
      bio: "Campus OS Administrator.",
      interests: ["infrastructure", "security"],
      skills: ["Kubernetes", "Firebase", "SysAdmin"],
      role: "admin",
      updatedAt: new Date().toISOString()
    }
  ];

  for (const profile of profiles) {
    const { id, ...data } = profile;
    await firestore.collection("profiles").doc(id).set(data);
  }
  console.log(`✅ Seeded ${profiles.length} profiles.`);

  // 2. Events
  const events = [
    {
      id: "evt-hackathon-24",
      title: "Campus Hackathon 2024",
      description: "Annual 48-hour hackathon. Build the future of our campus!",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      location: "Main Auditorium",
      organizerId: "demo-club-1",
      organizerName: "Tech Club Admin",
      category: "hackathon",
      attendeeCount: 150,
      tags: ["coding", "ai", "web3"],
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "evt-guest-lecture-1",
      title: "Guest Lecture: Future of IoT",
      description: "Join us for an insightful lecture by industry experts.",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Room 302, Block B",
      organizerId: "demo-faculty-1",
      organizerName: "Dr. Vikram Singh",
      category: "academic",
      attendeeCount: 45,
      tags: ["iot", "research"],
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
      createdAt: new Date().toISOString()
    }
  ];

  for (const event of events) {
    const { id, ...data } = event;
    await firestore.collection("events").doc(id).set(data);
  }
  console.log(`✅ Seeded ${events.length} events.`);

  // 3. Marketplace
  const items = [
    {
      id: "item-macbook",
      title: "MacBook Pro M1 (2020)",
      description: "Excellent condition, used for 2 years. Includes charger.",
      price: 60000,
      sellerId: "demo-student-1",
      sellerName: "Alice Sharma",
      category: "electronics",
      condition: "Good",
      status: "available",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "item-textbook-cs",
      title: "Introduction to Algorithms",
      description: "3rd Edition. No highlighting.",
      price: 1500,
      sellerId: "demo-student-1",
      sellerName: "Alice Sharma",
      category: "books",
      condition: "Like New",
      status: "available",
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      createdAt: new Date().toISOString()
    }
  ];

  for (const item of items) {
    const { id, ...data } = item;
    await firestore.collection("marketplace").doc(id).set(data);
  }
  console.log(`✅ Seeded ${items.length} marketplace items.`);

  // 4. Feed Posts
  const posts = [
    {
      id: "post-1",
      content: "Just submitted my project for the upcoming hackathon! So excited 🚀",
      authorId: "demo-student-1",
      authorName: "Alice Sharma",
      authorRole: "student",
      likesCount: 12,
      commentsCount: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: "post-2",
      content: "GlobalTech is hiring! Come visit our booth at the placement cell tomorrow.",
      authorId: "demo-recruiter-1",
      authorName: "Sarah Jenkins",
      authorRole: "recruiter",
      likesCount: 35,
      commentsCount: 8,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const post of posts) {
    const { id, ...data } = post;
    await firestore.collection("feed").doc(id).set(data);
  }
  console.log(`✅ Seeded ${posts.length} feed posts.`);

  // 5. Recruiters/Jobs
  const jobs = [
    {
      id: "job-sde-1",
      title: "Software Development Engineer I",
      company: "GlobalTech Inc.",
      location: "Bangalore",
      description: "Looking for fresh graduates with strong fundamentals in DSA and Web Development.",
      requirements: ["B.Tech CS/IT", "React", "Node.js"],
      recruiterId: "demo-recruiter-1",
      salary: "12LPA - 15LPA",
      type: "Full-time",
      status: "open",
      createdAt: new Date().toISOString()
    }
  ];

  for (const job of jobs) {
    const { id, ...data } = job;
    await firestore.collection("jobs").doc(id).set(data);
  }
  console.log(`✅ Seeded ${jobs.length} jobs.`);

  console.log("🎉 Seeding complete!");
  process.exit(0);
};

seedData().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
