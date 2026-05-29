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
  getAll: () => apiClient.get("/feed"),
  create: (content: string) => apiClient.post("/feed", { content }),
  like: (id: string) => apiClient.post(`/feed/${id}/like`),
};

export const chatService = {
  getConversations: () => apiClient.get("/chat/conversations"),
  getMessages: (conversationId: string) => apiClient.get(`/chat/messages/${conversationId}`),
  sendMessage: (receiverId: string, content: string) => apiClient.post("/chat/send", { receiverId, content }),
};

export const adminService = {
  getAnalytics: () => apiClient.get("/admin/analytics"),
  moderateUser: (userId: string, action: string) => apiClient.post("/admin/moderate", { userId, action }),
  postAnnouncement: (data: any) => apiClient.post("/admin/announcement", data),
  seed: () => apiClient.post("/admin/seed"),
};

export const teamService = {
  getAll: () => apiClient.get("/teams"),
  create: (data: any) => apiClient.post("/teams", data),
  joinRequest: (id: string) => apiClient.post(`/teams/${id}/request`),
  acceptRequest: (id: string, requesterId: string) => apiClient.post(`/teams/${id}/accept`, { requesterId }),
  rejectRequest: (id: string, requesterId: string) => apiClient.post(`/teams/${id}/reject`, { requesterId }),
};
