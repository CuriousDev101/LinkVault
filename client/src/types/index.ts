export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Tag {
  id: number;
  name: string;
  bookmarkCount?: number;
}

export interface Folder {
  id: number;
  name: string;
  createdAt: string;
  bookmarkCount: number;
}

export interface Bookmark {
  id: number;
  userId: number;
  folderId: number | null;
  folderName?: string | null;
  title: string;
  url: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface DashboardStats {
  totalBookmarks: number;
  totalFolders: number;
  totalTags: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentBookmarks: Bookmark[];
}
