import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { auth } from "../lib/firebase/client";
import { useAuthStore } from "../lib/stores/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Firebase Auth Token
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else if (process.env.NODE_ENV === "development") {
    // Fallback for Mock Login in development
    const mockRole = useAuthStore.getState().role || "student";
    const mockUid = useAuthStore.getState().user?.uid || "mock-uid";
    if (config.headers) {
      config.headers.Authorization = `Bearer mock-token-${mockRole}-${mockUid}`;
    }
  }
  return config;
}, (error: AxiosError) => {
  return Promise.reject(error);
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    const data = error.response?.data as { message?: string } | undefined;
    const message = data?.message || "Something went wrong";
    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  }
);

