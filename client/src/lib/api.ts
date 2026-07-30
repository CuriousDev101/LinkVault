import type { Bookmark, Folder, Tag, DashboardData, User } from "../types";

const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token and optionally redirect
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || "An unexpected error occurred";
    throw new Error(errorMsg);
  }

  return data as T;
}

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: { name: string; email: string; password: string }) =>
    apiRequest<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest<{ user: User }>("/auth/me"),

  updateProfile: (data: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) =>
    apiRequest<{ message: string; user: User }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Bookmarks API
export const bookmarksApi = {
  getAll: (params?: {
    search?: string;
    folderId?: string | number;
    tagId?: number;
    tagName?: string;
    sortBy?: "title" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.folderId !== undefined && params?.folderId !== "")
      query.set("folderId", String(params.folderId));
    if (params?.tagId) query.set("tagId", String(params.tagId));
    if (params?.tagName) query.set("tagName", params.tagName);
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

    const qs = query.toString();
    return apiRequest<{ bookmarks: Bookmark[] }>(`/bookmarks${qs ? `?${qs}` : ""}`);
  },

  getById: (id: number) =>
    apiRequest<{ bookmark: Bookmark }>(`/bookmarks/${id}`),

  create: (data: {
    title: string;
    url: string;
    description?: string | null;
    folderId?: number | null;
    tags?: string[];
  }) =>
    apiRequest<{ message: string; bookmark: Bookmark }>("/bookmarks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: {
      title?: string;
      url?: string;
      description?: string | null;
      folderId?: number | null;
      tags?: string[];
    }
  ) =>
    apiRequest<{ message: string; bookmark: Bookmark }>(`/bookmarks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/bookmarks/${id}`, {
      method: "DELETE",
    }),
};

// Folders API
export const foldersApi = {
  getAll: () => apiRequest<{ folders: Folder[] }>("/folders"),

  getById: (id: number) => apiRequest<{ folder: Folder }>(`/folders/${id}`),

  create: (name: string) =>
    apiRequest<{ message: string; folder: Folder }>("/folders", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  update: (id: number, name: string) =>
    apiRequest<{ message: string; folder: Folder }>(`/folders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/folders/${id}`, {
      method: "DELETE",
    }),
};

// Tags API
export const tagsApi = {
  getAll: () => apiRequest<{ tags: Tag[] }>("/tags"),

  create: (name: string) =>
    apiRequest<{ message: string; tag: Tag }>("/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  update: (id: number, name: string) =>
    apiRequest<{ message: string; tag: Tag }>(`/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/tags/${id}`, {
      method: "DELETE",
    }),
};

// Stats API
export const statsApi = {
  getStats: () => apiRequest<DashboardData>("/stats"),
};
