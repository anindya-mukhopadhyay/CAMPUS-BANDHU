import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import UserModel from "../models/user.model";
import EventModel from "../models/event.model";
import ListingModel from "../models/listing.model";
import AnnouncementModel from "../models/announcement.model";
import CollegeModel from "../models/college.model";
import SettingsModel from "../models/settings.model";
import AuditLogModel from "../models/audit-log.model";
import DepartmentModel from "../models/department.model";
import ClubModel from "../models/club.model";

import { apiOk } from "../utils/api-response";
import { emitRealtime } from "../utils/socket";
import { runDatabaseSeed } from "../utils/seed-helper";

export async function getAnalytics(_request: Request, response: Response) {
  // Aggregate stats from multiple collections
  const [totalUsers, totalEvents, activeListings] = await Promise.all([
    UserModel.countDocuments(),
    EventModel.countDocuments(),
    ListingModel.countDocuments()
  ]);

  response.json(apiOk({
    totalUsers,
    totalEvents,
    activeListings,
    timestamp: new Date().toISOString()
  }));
}

export async function listUsers(request: Request, response: Response) {
  const callerUid = (request as any).user?.uid;
  const caller = await UserModel.findOne({ uid: callerUid });

  let filter = {};
  if (caller && caller.role === "college_admin") {
    filter = { collegeId: caller.collegeId };
  }

  const users = await UserModel.find(filter).sort({ createdAt: -1 });
  response.json(apiOk(users.map((u) => u.toJSON())));
}

export async function moderateUser(request: Request, response: Response) {
  const { userId, action } = request.body; // action: 'ban' | 'unban' | 'approve' | 'reject'
  const adminName = (request as any).user?.name || (request as any).user?.email || "Super Admin";

  let status = "active";
  if (action === "ban") status = "banned";
  else if (action === "reject") status = "rejected";
  else if (action === "approve" || action === "unban") status = "active";

  const updatedUser = await UserModel.findOneAndUpdate(
    { uid: userId },
    { status },
    { new: true }
  );

  // Append rich audit log entry
  await AuditLogModel.create({
    action: `User ${action}ed`,
    target: updatedUser?.email || userId,
    admin: adminName,
    type: action === "ban" || action === "reject" ? "warning" : "success"
  });
  
  response.json(apiOk({ userId, status }));
}

export async function listColleges(_request: Request, response: Response) {
  const colleges = await CollegeModel.find({}).sort({ name: 1 });
  
  // Dynamically count users for each college code
  const collegesWithCounts = await Promise.all(
    colleges.map(async (college) => {
      const usersCount = await UserModel.countDocuments({ 
        collegeId: college.code 
      });
      return {
        name: college.name,
        code: college.code,
        status: college.status,
        users: usersCount,
        createdAt: college.createdAt
      };
    })
  );

  response.json(apiOk(collegesWithCounts));
}

export async function createCollege(request: Request, response: Response) {
  const { name, code } = request.body;
  const adminName = (request as any).user?.name || (request as any).user?.email || "Super Admin";

  const newCollege = await CollegeModel.create({
    name,
    code,
    status: "pending" // starts as pending verification
  });

  await AuditLogModel.create({
    action: "College created",
    target: `${name} (${code})`,
    admin: adminName,
    type: "info"
  });

  response.status(StatusCodes.CREATED).json(apiOk(newCollege));
}

export async function moderateCollege(request: Request, response: Response) {
  const { code, action } = request.body; // action: 'approve' | 'reject'
  const adminName = (request as any).user?.name || (request as any).user?.email || "Super Admin";

  const college = await CollegeModel.findOne({ code: code.toUpperCase() });
  if (!college) {
    response.status(StatusCodes.NOT_FOUND).json({ message: "College not found" });
    return;
  }

  if (action === "approve") {
    college.status = "active";
    await college.save();
  } else if (action === "reject") {
    await CollegeModel.deleteOne({ code: code.toUpperCase() });
  }

  await AuditLogModel.create({
    action: action === "approve" ? "College verified" : "College verification rejected",
    target: `${college.name} (${college.code})`,
    admin: adminName,
    type: action === "approve" ? "success" : "warning"
  });

  response.json(apiOk({ code, status: action === "approve" ? "active" : "deleted" }));
}

export async function listPendingEvents(_request: Request, response: Response) {
  const events = await EventModel.find({ 
    scope: "global", 
    status: "pending" 
  }).sort({ createdAt: -1 });
  
  response.json(apiOk(events.map(e => e.toJSON())));
}

export async function moderateEvent(request: Request, response: Response) {
  const { eventId, action } = request.body; // action: 'approve' | 'reject'
  const adminName = (request as any).user?.name || (request as any).user?.email || "College Admin";

  const event = await EventModel.findById(eventId);
  if (!event) {
    response.status(StatusCodes.NOT_FOUND).json({ message: "Event not found" });
    return;
  }

  event.status = action === "approve" ? "active" : "rejected";
  await event.save();

  await AuditLogModel.create({
    action: action === "approve" ? "Event approved" : "Event rejected",
    target: event.title,
    admin: adminName,
    type: action === "approve" ? "success" : "warning"
  });

  response.json(apiOk({ eventId, status: event.status }));
}

export async function getSettings(request: Request, response: Response) {
  const { key } = request.query;
  const settingsKey = (key as string) || "ai_controls";

  const settingsDoc = await SettingsModel.findOne({ key: settingsKey });
  
  // Default values for AI controls if not set
  const defaultValue = {
    toxicityFilter: true,
    marketplaceSpamFilter: true,
    contextAwareness: true
  };

  const value = settingsDoc ? settingsDoc.value : defaultValue;
  response.json(apiOk({ key: settingsKey, value }));
}

export async function updateSettings(request: Request, response: Response) {
  const { key, value } = request.body;
  const adminName = (request as any).user?.name || (request as any).user?.email || "Super Admin";

  const updatedDoc = await SettingsModel.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true }
  );

  await AuditLogModel.create({
    action: "AI controls updated",
    target: "Global settings config",
    admin: adminName,
    type: "info"
  });

  response.json(apiOk(updatedDoc));
}

export async function listAuditLogs(_request: Request, response: Response) {
  const logs = await AuditLogModel.find({}).sort({ createdAt: -1 }).limit(50);
  
  const logsMapped = logs.map((log) => {
    const timeAgo = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (seconds < 60) return "Just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return date.toLocaleDateString();
    };

    return {
      action: log.action,
      target: log.target,
      admin: log.admin,
      time: timeAgo(log.createdAt || new Date()),
      type: log.type
    };
  });

  response.json(apiOk(logsMapped));
}

// College Admin Department Endpoints
export async function listDepartments(request: Request, response: Response) {
  const collegeId = request.query.collegeId || (request as any).user?.collegeId || "NSUT";
  
  let depts = await DepartmentModel.find({ collegeId: (collegeId as string).toUpperCase() });
  
  // Seed default departments if none exist for a standard demo college
  if (depts.length === 0 && (collegeId === "NSUT" || collegeId === "IITD")) {
    const defaults: Record<string, Array<any>> = {
      "NSUT": [
        { collegeId: "NSUT", name: "Computer Science", hod: "Dr. A. Sharma", students: 1200, status: "active" },
        { collegeId: "NSUT", name: "Electronics", hod: "Dr. S. Verma", students: 850, status: "active" },
        { collegeId: "NSUT", name: "Information Tech", hod: "Pending", students: 400, status: "setup_required" },
      ],
      "IITD": [
        { collegeId: "IITD", name: "Mechanical Eng", hod: "Dr. R. Kapoor", students: 950, status: "active" },
        { collegeId: "IITD", name: "Civil Eng", hod: "Dr. M. Gupta", students: 600, status: "active" },
        { collegeId: "IITD", name: "Biotech", hod: "Dr. P. Roy", students: 300, status: "active" },
      ]
    };
    const defaultList = defaults[collegeId as "NSUT" | "IITD"];
    depts = await DepartmentModel.insertMany(defaultList) as any;
  }

  response.json(apiOk(depts.map(d => d.toJSON())));
}

export async function createDepartment(request: Request, response: Response) {
  const { name, hod, students } = request.body;
  const collegeId = request.body.collegeId || (request as any).user?.collegeId || "NSUT";
  const adminName = (request as any).user?.name || (request as any).user?.email || "College Admin";

  const newDept = await DepartmentModel.create({
    collegeId: (collegeId as string).toUpperCase(),
    name,
    hod: hod || "Pending",
    students: Number(students) || 0,
    status: hod ? "active" : "setup_required"
  });

  await AuditLogModel.create({
    action: "Department created",
    target: `${name} (${collegeId})`,
    admin: adminName,
    type: "info"
  });

  response.status(StatusCodes.CREATED).json(apiOk(newDept));
}

// College Admin Club Endpoints
export async function listClubs(request: Request, response: Response) {
  const collegeId = request.query.collegeId || (request as any).user?.collegeId || "NSUT";
  
  let clubs = await ClubModel.find({ collegeId: (collegeId as string).toUpperCase() });

  // Seed default clubs if none exist for a standard demo college
  if (clubs.length === 0 && (collegeId === "NSUT" || collegeId === "IITD")) {
    const defaultClubs: Array<any> = [
      { collegeId: collegeId.toString().toUpperCase(), name: "Web3 Builders", category: "Technical", founder: "Arjun M.", studentsInterested: 120, status: "pending" },
      { collegeId: collegeId.toString().toUpperCase(), name: "Campus Debate", category: "Cultural", founder: "Priya S.", studentsInterested: 85, status: "pending" }
    ];
    clubs = await ClubModel.insertMany(defaultClubs) as any;
  }

  response.json(apiOk(clubs.map(c => c.toJSON())));
}

export async function createClub(request: Request, response: Response) {
  const { 
    name, 
    category, 
    founder, 
    studentsInterested,
    allocatedFacultyId,
    allocatedFacultyName,
    allocatedStudentId,
    allocatedStudentName,
    status
  } = request.body;
  
  const collegeId = request.body.collegeId || (request as any).user?.collegeId || "NSUT";

  const newClub = await ClubModel.create({
    collegeId: (collegeId as string).toUpperCase(),
    name,
    category,
    founder: founder || allocatedStudentName || "Student",
    studentsInterested: Number(studentsInterested) || 0,
    status: status || "active",
    allocatedFacultyId,
    allocatedFacultyName,
    allocatedStudentId,
    allocatedStudentName
  });

  response.status(StatusCodes.CREATED).json(apiOk(newClub));
}

export async function moderateClub(request: Request, response: Response) {
  const { clubId, action } = request.body; // action: 'approve' | 'reject'
  const adminName = (request as any).user?.name || (request as any).user?.email || "College Admin";

  const club = await ClubModel.findById(clubId);
  if (!club) {
    response.status(StatusCodes.NOT_FOUND).json({ message: "Club not found" });
    return;
  }

  club.status = action === "approve" ? "active" : "rejected";
  await club.save();

  await AuditLogModel.create({
    action: action === "approve" ? "Club approved" : "Club rejected",
    target: `${club.name} (${club.collegeId})`,
    admin: adminName,
    type: action === "approve" ? "success" : "warning"
  });

  response.json(apiOk({ clubId, status: club.status }));
}

// College Admin Campus Events Endpoints
export async function listCampusEvents(request: Request, response: Response) {
  const collegeId = request.query.collegeId || (request as any).user?.collegeId || "NSUT";
  const { status } = request.query;

  const query: any = { 
    collegeId: (collegeId as string).toUpperCase() 
  };
  
  if (status) {
    query.status = status;
  }

  let events = await EventModel.find(query).sort({ createdAt: -1 });

  // Seed default events if none exist for a standard demo college
  if (events.length === 0 && (collegeId === "NSUT" || collegeId === "IITD")) {
    const defaultEvents: Array<any> = [
      {
        title: "HackTheCampus 2026",
        description: "An institutional hackathon to build amazing campus widgets.",
        organizerId: "demo-organizer",
        organizerName: "Tech Club",
        date: "2026-06-10",
        collegeId: collegeId.toString().toUpperCase(),
        status: "pending",
        scope: "local"
      },
      {
        title: "Annual Cultural Fest",
        description: "The biggest annual student celebration with dance, music, and art.",
        organizerId: "demo-organizer",
        organizerName: "Student Council",
        date: "2026-10-15",
        collegeId: collegeId.toString().toUpperCase(),
        status: "pending",
        scope: "local"
      }
    ];
    events = await EventModel.insertMany(defaultEvents) as any;
  }

  response.json(apiOk(events.map(e => e.toJSON())));
}

export async function postAnnouncement(request: Request, response: Response) {
  const { title, content, targetAudience } = request.body;
  
  const announcementDoc = await AnnouncementModel.create({
    title,
    content,
    targetAudience // 'all' | 'students' | 'admins'
  });

  const announcement = announcementDoc.toJSON() as any;
  
  // Broadcast via sockets
  emitRealtime(request, "admin:announcement", announcement);
  
  response.status(StatusCodes.CREATED).json(apiOk(announcement));
}

export async function seedDatabase(request: Request, response: Response) {
  const userId = (request as any).user?.uid;
  const userDisplayName = (request as any).user?.name || (request as any).user?.displayName || "Demo User";
  
  await runDatabaseSeed(userId, userDisplayName);
  
  response.json(apiOk({ message: "Database seeded successfully!" }));
}
