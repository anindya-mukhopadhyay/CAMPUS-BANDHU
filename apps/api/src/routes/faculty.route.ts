import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth, requireRole } from "../middleware/auth";
import { apiOk } from "../utils/api-response";
import { StatusCodes } from "http-status-codes";

import ClubModel from "../models/club.model";
import EventModel from "../models/event.model";
import UserModel from "../models/user.model";
import ClassModel from "../models/class.model";
import ClassNoteModel from "../models/class-note.model";

export const facultyRouter = Router();

// Apply auth and faculty-role checks
facultyRouter.use(requireAuth);
facultyRouter.use(requireRole("faculty", "super_admin"));

// 1. Get allocated clubs
facultyRouter.get(
  "/faculty/clubs",
  asyncHandler(async (request, response) => {
    const facultyUid = request.user?.uid;
    const clubs = await ClubModel.find({ allocatedFacultyId: facultyUid });
    response.json(apiOk(clubs.map((c) => c.toJSON())));
  })
);

// 2. Post event for an allocated club
facultyRouter.post(
  "/faculty/clubs/:clubId/events",
  asyncHandler(async (request, response) => {
    const { clubId } = request.params;
    const facultyUid = request.user?.uid;

    const club = await ClubModel.findOne({ _id: clubId, allocatedFacultyId: facultyUid });
    if (!club) {
      response.status(StatusCodes.FORBIDDEN).json({ message: "You are not authorized for this club or club not found." });
      return;
    }

    const { title, description, category, startAt, endAt, venue, tags, image, date, time, location } = request.body;

    const newEvent = (await EventModel.create({
      title,
      description,
      category: category || "Hackathon",
      startAt: startAt ? new Date(startAt) : undefined,
      endAt: endAt ? new Date(endAt) : undefined,
      venue,
      tags: tags || [],
      organizerId: clubId as string,
      organizerName: club.name,
      status: "active",
      scope: "local",
      collegeId: club.collegeId,
      date,
      time,
      location,
      imageUrl: image
    })) as any;

    response.status(StatusCodes.CREATED).json(apiOk(newEvent.toJSON()));
  })
);

// 3. Get classes taught by faculty
facultyRouter.get(
  "/faculty/classes",
  asyncHandler(async (request, response) => {
    const facultyUid = request.user?.uid;
    const classes = await ClassModel.find({ teacherId: facultyUid });
    response.json(apiOk(classes.map((c) => c.toJSON())));
  })
);

// 4. Create a Class (and auto-register matching students of same college & department)
facultyRouter.post(
  "/faculty/classes",
  asyncHandler(async (request, response) => {
    const facultyUid = request.user?.uid;
    const facultyProfile = await UserModel.findOne({ uid: facultyUid });
    if (!facultyProfile) {
      response.status(StatusCodes.NOT_FOUND).json({ message: "Faculty profile not found" });
      return;
    }

    const { name, code, department } = request.body;
    const collegeId = facultyProfile.collegeId || "NSUT";

    // Auto-register matching students of same college & department
    const matchingStudents = await UserModel.find({
      role: "student",
      collegeId,
      department: department || facultyProfile.department
    });

    const registeredStudentIds = matchingStudents.map((s) => s.uid);

    const newClass = (await ClassModel.create({
      name,
      code,
      teacherId: facultyUid,
      teacherName: facultyProfile.fullName,
      department: department || facultyProfile.department,
      collegeId,
      registeredStudentIds
    })) as any;

    response.status(StatusCodes.CREATED).json(apiOk(newClass.toJSON()));
  })
);

// 5. Get students registered in a class
facultyRouter.get(
  "/faculty/classes/:classId/students",
  asyncHandler(async (request, response) => {
    const { classId } = request.params;
    const facultyUid = request.user?.uid;

    const classObj = await ClassModel.findOne({ _id: classId, teacherId: facultyUid });
    if (!classObj) {
      response.status(StatusCodes.NOT_FOUND).json({ message: "Class not found" });
      return;
    }

    const students = await UserModel.find({ uid: { $in: classObj.registeredStudentIds } });
    response.json(apiOk(students.map((s) => s.toJSON())));
  })
);

// 6. Get note history for a class
facultyRouter.get(
  "/faculty/classes/:classId/notes",
  asyncHandler(async (request, response) => {
    const { classId } = request.params;
    const facultyUid = request.user?.uid;

    const classObj = await ClassModel.findOne({ _id: classId, teacherId: facultyUid });
    if (!classObj) {
      // Compatibility check: let registered students read it too!
      const studentObj = await ClassModel.findOne({ _id: classId, registeredStudentIds: facultyUid });
      if (!studentObj) {
        response.status(StatusCodes.NOT_FOUND).json({ message: "Class not found" });
        return;
      }
    }

    const notes = await ClassNoteModel.find({ classId }).sort({ createdAt: -1 });
    response.json(apiOk(notes.map((n) => n.toJSON())));
  })
);

// 7. Share Note / PDF & send mail logs
facultyRouter.post(
  "/faculty/classes/:classId/notes",
  asyncHandler(async (request, response) => {
    const { classId } = request.params;
    const facultyUid = request.user?.uid;
    const { title, content, pdfData, pdfName } = request.body;

    const classObj = await ClassModel.findOne({ _id: classId, teacherId: facultyUid });
    if (!classObj) {
      response.status(StatusCodes.NOT_FOUND).json({ message: "Class not found" });
      return;
    }

    const facultyProfile = await UserModel.findOne({ uid: facultyUid });
    const newNote = (await ClassNoteModel.create({
      classId: classId as string,
      title,
      content,
      pdfData,
      pdfName,
      senderName: facultyProfile?.fullName || "Faculty Teacher"
    })) as any;

    // Send mock SMTP emails
    const registeredStudents = await UserModel.find({ uid: { $in: classObj.registeredStudentIds } });
    const emailLogs = registeredStudents.map((s) => ({
      name: s.fullName,
      email: s.email,
      status: "sent"
    }));

    response.status(StatusCodes.CREATED).json(apiOk({
      note: newNote.toJSON(),
      emailLogs
    }));
  })
);

// 8. Manual class registration helper
facultyRouter.post(
  "/faculty/classes/:classId/register",
  asyncHandler(async (request, response) => {
    const { classId } = request.params;
    const { studentUid } = request.body;

    const classObj = await ClassModel.findById(classId);
    if (!classObj) {
      response.status(StatusCodes.NOT_FOUND).json({ message: "Class not found" });
      return;
    }

    if (!classObj.registeredStudentIds.includes(studentUid)) {
      classObj.registeredStudentIds.push(studentUid);
      await classObj.save();
    }

    response.json(apiOk(classObj.toJSON()));
  })
);
