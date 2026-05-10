import { auth } from "@/lib/firebase/client";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

async function getToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  return user.getIdToken();
}

export async function apiRequest<TData>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown
): Promise<TData> {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as TData;
}
