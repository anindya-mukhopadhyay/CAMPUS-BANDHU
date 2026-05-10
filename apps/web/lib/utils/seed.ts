import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/client";

export const seedDemoDataFromClient = async (userId: string, userDisplayName: string) => {
  console.log("🌱 Starting client-side seed...");

  // 1. Update the user's own profile
  await setDoc(
    doc(db, "profiles", userId),
    {
      fullName: userDisplayName || "Demo User",
      department: "Computer Science",
      graduationYear: 2025,
      bio: "Passionate about AI and building decentralized systems.",
      interests: ["ai", "blockchain", "hackathon"],
      skills: ["React", "Node.js", "Python"],
      role: "admin", // Make them admin so they can see everything
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  // 2. Events
  const events = [
    {
      id: "evt-hackathon-24",
      title: "Campus Hackathon 2024",
      description: "Annual 48-hour hackathon. Build the future of our campus!",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Main Auditorium",
      organizerId: userId,
      organizerName: userDisplayName,
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
      organizerId: userId,
      organizerName: "Dr. Vikram Singh",
      category: "academic",
      attendeeCount: 45,
      tags: ["iot", "research"],
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
      createdAt: new Date().toISOString()
    }
  ];

  for (const event of events) {
    await setDoc(doc(db, "events", event.id), event);
  }

  // 3. Marketplace
  const items = [
    {
      id: "item-macbook",
      title: "MacBook Pro M1 (2020)",
      description: "Excellent condition, used for 2 years. Includes charger.",
      price: 60000,
      sellerId: userId,
      sellerName: userDisplayName,
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
      sellerId: userId,
      sellerName: userDisplayName,
      category: "books",
      condition: "Like New",
      status: "available",
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      createdAt: new Date().toISOString()
    }
  ];

  for (const item of items) {
    await setDoc(doc(db, "marketplace", item.id), item);
  }

  // 4. Feed Posts (Using /posts based on security rules)
  const posts = [
    {
      id: "post-1",
      content: "Just submitted my project for the upcoming hackathon! So excited 🚀",
      authorId: userId,
      authorName: userDisplayName,
      authorRole: "student",
      likesCount: 12,
      commentsCount: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: "post-2",
      content: "GlobalTech is hiring! Come visit our booth at the placement cell tomorrow.",
      authorId: userId,
      authorName: "Sarah Jenkins",
      authorRole: "recruiter",
      likesCount: 35,
      commentsCount: 8,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const post of posts) {
    // Note: The original script used 'feed', but rules say 'posts'. Let's write to both to be safe or just 'posts'.
    await setDoc(doc(db, "posts", post.id), post);
    await setDoc(doc(db, "feed", post.id), post);
  }

  // 5. Jobs (Using /opportunities based on security rules)
  const jobs = [
    {
      id: "job-sde-1",
      title: "Software Development Engineer I",
      company: "GlobalTech Inc.",
      location: "Bangalore",
      description: "Looking for fresh graduates with strong fundamentals in DSA and Web Development.",
      requirements: ["B.Tech CS/IT", "React", "Node.js"],
      recruiterId: userId,
      salary: "12LPA - 15LPA",
      type: "Full-time",
      status: "open",
      createdAt: new Date().toISOString()
    }
  ];

  for (const job of jobs) {
    await setDoc(doc(db, "opportunities", job.id), job);
    await setDoc(doc(db, "jobs", job.id), job);
  }

  console.log("🎉 Client-side seeding complete!");
  return true;
};
