import { apiClient } from "./api-client";

export const authService = {
  signup: (data: any) => apiClient.post("/auth/signup", data),
  login: () => apiClient.post("/auth/login"),
  verifyRole: () => apiClient.get("/auth/verify-role"),
};

export const eventService = {
  getAll: () => apiClient.get("/events"),
  getById: (id: string) => apiClient.get(`/events/${id}`),
  create: (data: any) => apiClient.post("/events", data),
  register: (id: string) => apiClient.post(`/events/${id}/register`),
};

export const marketplaceService = {
  getAll: () => apiClient.get("/marketplace"),
  create: (data: any) => apiClient.post("/marketplace", data),
  update: (id: string, data: any) => apiClient.patch(`/marketplace/${id}`, data),
  delete: (id: string) => apiClient.delete(`/marketplace/${id}`),
  markAsSold: (id: string) => apiClient.patch(`/marketplace/${id}/sold`),
};

export const userService = {
  getMe: () => apiClient.get("/users/me"),
  getProfile: (id: string) => apiClient.get(`/users/${id}`),
  updateProfile: (data: any) => apiClient.patch("/users/me", data),
  addSkill: (skill: string) => apiClient.post("/users/me/skills", { skill }),
};

export const feedService = {
  getAll: (page?: number) => apiClient.get(`/feed${page ? `?page=${page}` : ""}`),
  create: (content: string, image?: string) => apiClient.post("/feed", { content, image }),
  like: (id: string) => apiClient.post(`/feed/${id}/like`),
  addComment: (id: string, content: string) => apiClient.post(`/feed/${id}/comments`, { content }),
  deleteComment: (postId: string, commentId: string) => apiClient.delete(`/feed/${postId}/comments/${commentId}`),
  delete: (id: string) => apiClient.delete(`/feed/${id}`),
};

export const chatService = {
  getConversations: () => apiClient.get("/chat/conversations"),
  getMessages: (conversationId: string) => apiClient.get(`/chat/messages/${conversationId}`),
  sendMessage: (receiverId: string, content: string) => apiClient.post("/chat/send", { receiverId, content }),
};

export const adminService = {
  getAnalytics: () => apiClient.get("/admin/analytics"),
  getUsers: () => apiClient.get("/admin/users"),
  moderateUser: (userId: string, action: string) => apiClient.post("/admin/moderate", { userId, action }),
  postAnnouncement: (data: any) => apiClient.post("/admin/announcement", data),
  seed: () => apiClient.post("/admin/seed"),
  getColleges: () => apiClient.get("/admin/colleges"),
  createCollege: (data: { name: string; code: string }) => apiClient.post("/admin/colleges", data),
  moderateCollege: (code: string, action: "approve" | "reject") => apiClient.post("/admin/colleges/moderate", { code, action }),
  getPendingEvents: () => apiClient.get("/admin/events/pending"),
  moderateEvent: (eventId: string, action: "approve" | "reject") => apiClient.post("/admin/events/moderate", { eventId, action }),
  getSettings: (key?: string) => apiClient.get(`/admin/settings${key ? `?key=${key}` : ""}`),
  updateSettings: (key: string, value: any) => apiClient.post("/admin/settings", { key, value }),
  getAuditLogs: () => apiClient.get("/admin/audit-logs"),
  getDepartments: (collegeId?: string) => apiClient.get(`/admin/departments${collegeId ? `?collegeId=${collegeId}` : ""}`),
  createDepartment: (data: any) => apiClient.post("/admin/departments", data),
  getClubs: (collegeId?: string) => apiClient.get(`/admin/clubs${collegeId ? `?collegeId=${collegeId}` : ""}`),
  createClub: (data: any) => apiClient.post("/admin/clubs", data),
  moderateClub: (clubId: string, action: "approve" | "reject") => apiClient.post("/admin/clubs/moderate", { clubId, action }),
  getCampusEvents: (collegeId?: string, status?: string) => apiClient.get(`/admin/events${collegeId || status ? `?${collegeId ? `collegeId=${collegeId}&` : ""}${status ? `status=${status}` : ""}` : ""}`),
};

export const teamService = {
  getAll: () => apiClient.get("/teams"),
  create: (data: any) => apiClient.post("/teams", data),
  update: (id: string, data: any) => apiClient.patch(`/teams/${id}`, data),
  delete: (id: string) => apiClient.delete(`/teams/${id}`),
  joinRequest: (id: string) => apiClient.post(`/teams/${id}/request`),
  acceptRequest: (id: string, requesterId: string) => apiClient.post(`/teams/${id}/accept`, { requesterId }),
  rejectRequest: (id: string, requesterId: string) => apiClient.post(`/teams/${id}/reject`, { requesterId }),
  transferLead: (id: string, newLeadId: string) => apiClient.post(`/teams/${id}/transfer-lead`, { newLeadId }),
};

export const systemService = {
  getSystemPulse: () => apiClient.get("/system-pulse"),
};

export const recruiterService = {
  getStats: () => apiClient.get("/recruiters/stats"),
};

export const facultyService = {
  getClubs: () => apiClient.get("/faculty/clubs"),
  postClubEvent: (clubId: string, data: any) => apiClient.post(`/faculty/clubs/${clubId}/events`, data),
  getClasses: () => apiClient.get("/faculty/classes"),
  createClass: (data: { name: string; code: string; department?: string }) => apiClient.post("/faculty/classes", data),
  getClassStudents: (classId: string) => apiClient.get(`/faculty/classes/${classId}/students`),
  getClassNotes: (classId: string) => apiClient.get(`/faculty/classes/${classId}/notes`),
  shareNote: (classId: string, data: { title: string; content: string; pdfData?: string; pdfName?: string }) => apiClient.post(`/faculty/classes/${classId}/notes`, data),
  registerClass: (classId: string, studentUid: string) => apiClient.post(`/faculty/classes/${classId}/register`, { studentUid }),
  getStudentClasses: () => apiClient.get("/faculty/student/classes"),
  joinClass: (classId: string) => apiClient.post(`/faculty/student/classes/${classId}/join`, {})
};

