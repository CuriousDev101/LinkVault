import React, { useState } from "react";
import { useSearchParams, useOutletContext } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  ArrowUpDown,
  X,
  Plus,
  Folder as FolderIcon,
  Tag as TagIcon,
  Bookmark as BookmarkIcon,
} from "lucide-react";
import { bookmarksApi } from "../lib/api";
import type { Bookmark, Folder, Tag } from "../types";
import { BookmarkCard } from "../components/BookmarkCard";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";

interface OutletContextType {
  folders: Folder[];
  tags: Tag[];
  onOpenNewBookmark: () => void;
  onEditBookmark: (bookmark: Bookmark) => void;
}

export const Bookmarks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { folders, tags, onOpenNewBookmark, onEditBookmark } =
    useOutletContext<OutletContextType>();

  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);

  // Read URL search params
  const search = searchParams.get("search") || "";
  const folderId = searchParams.get("folderId") || "";
  const tagName = searchParams.get("tagName") || "";
  const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as any) || "desc";

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bookmarks", { search, folderId, tagName, sortBy, sortOrder }],
    queryFn: () =>
      bookmarksApi.getAll({
        search,
        folderId,
        tagName,
        sortBy,
        sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bookmarksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setBookmarkToDelete(null);
    },
  });

  const bookmarks = data?.bookmarks || [];

  const updateFilter = (key: string, val: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (val === null || val === "") {
      next.delete(key);
    } else {
      next.set(key, val);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(search || folderId || tagName || sortBy !== "createdAt" || sortOrder !== "desc");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight flex items-center gap-2.5">
            <BookmarkIcon className="w-6 h-6 text-[#8B5CF6]" />
            <span>All Bookmarks</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Browse, search, and manage all your saved web links.
          </p>
        </div>

        <button
          onClick={onOpenNewBookmark}
          className="px-4 py-2 rounded-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-sm transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bookmark</span>
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-[#141419] p-4 rounded-lg border border-[#27272F] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search by title, URL, description, or tag..."
              className="w-full pl-10 pr-10 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA] placeholder-[#71717A]"
            />
            {search && (
              <button
                onClick={() => updateFilter("search", null)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717A] hover:text-[#FAFAFA] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Folder Dropdown Filter */}
            <div className="relative flex items-center">
              <FolderIcon className="w-3.5 h-3.5 text-[#71717A] absolute left-3 pointer-events-none" />
              <select
                value={folderId}
                onChange={(e) => updateFilter("folderId", e.target.value)}
                className="pl-8.5 pr-8 py-2 text-xs font-medium bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] transition cursor-pointer appearance-none text-[#A1A1AA]"
              >
                <option value="">All Folders</option>
                <option value="unorganized">Uncategorized</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Dropdown Filter */}
            <div className="relative flex items-center">
              <TagIcon className="w-3.5 h-3.5 text-[#71717A] absolute left-3 pointer-events-none" />
              <select
                value={tagName}
                onChange={(e) => updateFilter("tagName", e.target.value)}
                className="pl-8.5 pr-8 py-2 text-xs font-medium bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] transition cursor-pointer appearance-none text-[#A1A1AA]"
              >
                <option value="">All Tags</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.name}>
                    #{t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#71717A] absolute left-3 pointer-events-none" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split("-");
                  const next = new URLSearchParams(searchParams);
                  next.set("sortBy", by);
                  next.set("sortOrder", order);
                  setSearchParams(next);
                }}
                className="pl-8.5 pr-8 py-2 text-xs font-medium bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] transition cursor-pointer appearance-none text-[#A1A1AA]"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="title-asc">Title (A to Z)</option>
                <option value="title-desc">Title (Z to A)</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-xs font-medium text-[#71717A] hover:text-[#F87171] hover:bg-[#1C1C24] rounded-md transition cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[#71717A] font-medium">Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1C1C24] text-[#8B5CF6] border border-[#27272F]">
                <span>Query: "{search}"</span>
                <button
                  onClick={() => updateFilter("search", null)}
                  className="hover:text-[#F87171] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {folderId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1C1C24] text-[#FBBF24] border border-[#27272F]">
                <span>
                  Folder: {folderId === "unorganized" ? "Uncategorized" : folders.find((f) => String(f.id) === folderId)?.name || folderId}
                </span>
                <button
                  onClick={() => updateFilter("folderId", null)}
                  className="hover:text-[#F87171] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {tagName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1C1C24] text-[#34D399] border border-[#27272F]">
                <span>Tag: #{tagName}</span>
                <button
                  onClick={() => updateFilter("tagName", null)}
                  className="hover:text-[#F87171] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bookmarks Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 bg-[#141419] rounded-lg border border-[#27272F] p-5 animate-pulse"
            >
              <div className="h-4 bg-[#1C1C24] rounded-md w-1/3 mb-3" />
              <div className="h-5 bg-[#1C1C24] rounded-md w-3/4 mb-2" />
              <div className="h-3 bg-[#1C1C24] rounded-md w-full mb-4" />
              <div className="h-3 bg-[#1C1C24] rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No bookmarks match your filters" : "No bookmarks saved yet"}
          description={
            hasActiveFilters
              ? "Try clearing or adjusting your search filters to see more results."
              : "Click '+ Add Bookmark' to begin organizing your favorite websites."
          }
          actionLabel={hasActiveFilters ? "Clear All Filters" : "Add Bookmark"}
          onAction={hasActiveFilters ? clearAllFilters : onOpenNewBookmark}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs text-[#71717A] mb-3 px-1">
            <span>Showing {bookmarks.length} {bookmarks.length === 1 ? "bookmark" : "bookmarks"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={onEditBookmark}
                onDelete={(b) => setBookmarkToDelete(b)}
                onTagClick={(tag) => updateFilter("tagName", tag)}
                onFolderClick={(fId) => updateFilter("folderId", String(fId))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!bookmarkToDelete}
        title="Delete Bookmark"
        message={`Are you sure you want to delete "${bookmarkToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Bookmark"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (bookmarkToDelete) {
            deleteMutation.mutate(bookmarkToDelete.id);
          }
        }}
        onCancel={() => setBookmarkToDelete(null)}
      />
    </div>
  );
};
