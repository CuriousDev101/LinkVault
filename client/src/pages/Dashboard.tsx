import React, { useState } from "react";
import { Link, useOutletContext, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark as BookmarkIcon,
  Folder as FolderIcon,
  Tag as TagIcon,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { statsApi, bookmarksApi, foldersApi } from "../lib/api";
import type { Bookmark, Folder, Tag } from "../types";
import { BookmarkCard } from "../components/BookmarkCard";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FolderModal } from "../components/FolderModal";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

interface OutletContextType {
  folders: Folder[];
  tags: Tag[];
  onOpenNewBookmark: () => void;
  onEditBookmark: (bookmark: Bookmark) => void;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { folders, onOpenNewBookmark, onEditBookmark } =
    useOutletContext<OutletContextType>();

  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: statsApi.getStats,
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: (id: number) => bookmarksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setBookmarkToDelete(null);
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) => foldersApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setIsFolderModalOpen(false);
    },
  });

  const stats = data?.stats || {
    totalBookmarks: 0,
    totalFolders: 0,
    totalTags: 0,
  };

  const recentBookmarks = data?.recentBookmarks || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Surface */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141419] p-6 sm:p-7 rounded-lg text-[#FAFAFA] border border-[#27272F] shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-[#8B5CF6] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            Hello, {user?.name || "Explorer"}
          </h1>
          <p className="mt-1 text-[#A1A1AA] text-sm max-w-xl">
            Save, organize, and quickly find your resources in your personal LinkVault.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-[#1C1C24] hover:bg-[#27272F] text-[#FAFAFA] border border-[#27272F] font-medium text-sm transition flex items-center gap-2 cursor-pointer"
          >
            <FolderIcon className="w-4 h-4 text-[#FBBF24]" />
            <span>New Folder</span>
          </button>
          <button
            onClick={onOpenNewBookmark}
            className="px-4 py-2 rounded-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-sm transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bookmark</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141419] p-5 rounded-lg border border-[#27272F] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
              Total Bookmarks
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] mt-1">
              {isLoading ? "..." : stats.totalBookmarks}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-[#1C1C24] text-[#8B5CF6] border border-[#27272F] flex items-center justify-center">
            <BookmarkIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141419] p-5 rounded-lg border border-[#27272F] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
              Folders
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] mt-1">
              {isLoading ? "..." : stats.totalFolders}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-[#1C1C24] text-[#FBBF24] border border-[#27272F] flex items-center justify-center">
            <FolderIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141419] p-5 rounded-lg border border-[#27272F] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
              Tags
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] mt-1">
              {isLoading ? "..." : stats.totalTags}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-[#1C1C24] text-[#34D399] border border-[#27272F] flex items-center justify-center">
            <TagIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Folders Quick Access */}
      {folders.length > 0 && (
        <div className="bg-[#141419] p-5 rounded-lg border border-[#27272F] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#FAFAFA] flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-[#FBBF24]" />
              <span>Folders</span>
            </h2>
            <Link
              to="/folders"
              className="text-xs font-semibold text-[#8B5CF6] hover:text-[#7C3AED] flex items-center gap-1 transition"
            >
              <span>Manage Folders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {folders.slice(0, 4).map((f) => (
              <Link
                key={f.id}
                to={`/bookmarks?folderId=${f.id}`}
                className="p-3.5 rounded-md bg-[#1C1C24] hover:bg-[#27272F] border border-[#27272F] hover:border-[#3F3F46] transition group flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#FAFAFA] group-hover:text-[#8B5CF6] truncate">
                    {f.name}
                  </p>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    {f.bookmarkCount} {f.bookmarkCount === 1 ? "bookmark" : "bookmarks"}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#8B5CF6] transition shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookmarks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#FAFAFA]">Recently Saved</h2>
          <Link
            to="/bookmarks"
            className="text-xs font-semibold text-[#8B5CF6] hover:text-[#7C3AED] flex items-center gap-1 transition"
          >
            <span>View All Bookmarks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookmarks.length === 0 ? (
          <EmptyState
            title="Your vault is empty"
            description="Start saving articles, tools, and docs to keep them easily accessible."
            actionLabel="Add Your First Bookmark"
            onAction={onOpenNewBookmark}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={onEditBookmark}
                onDelete={(b) => setBookmarkToDelete(b)}
                onTagClick={(tagName) => navigate(`/bookmarks?tagName=${encodeURIComponent(tagName)}`)}
                onFolderClick={(folderId) => navigate(`/bookmarks?folderId=${folderId}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!bookmarkToDelete}
        title="Delete Bookmark"
        message={`Are you sure you want to delete "${bookmarkToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Bookmark"
        isLoading={deleteBookmarkMutation.isPending}
        onConfirm={() => {
          if (bookmarkToDelete) {
            deleteBookmarkMutation.mutate(bookmarkToDelete.id);
          }
        }}
        onCancel={() => setBookmarkToDelete(null)}
      />

      {/* Folder Creation Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        isLoading={createFolderMutation.isPending}
        onClose={() => setIsFolderModalOpen(false)}
        onSave={async (name) => {
          await createFolderMutation.mutateAsync(name);
        }}
      />
    </div>
  );
};
