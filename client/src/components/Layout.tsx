import React, { useState } from "react";
import { Outlet } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BookmarkModal } from "./BookmarkModal";
import { foldersApi, tagsApi, bookmarksApi } from "../lib/api";
import type { Bookmark } from "../types";
import { PanelLeft, Plus } from "lucide-react";

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("linkvault_sidebar_collapsed") === "true";
  });
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkToEdit, setBookmarkToEdit] = useState<Bookmark | null>(null);

  const queryClient = useQueryClient();

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("linkvault_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Queries for folders and tags
  const { data: foldersData } = useQuery({
    queryKey: ["folders"],
    queryFn: foldersApi.getAll,
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags"],
    queryFn: tagsApi.getAll,
  });

  const folders = foldersData?.folders || [];
  const tags = tagsData?.tags || [];

  // Bookmark Mutations
  const createMutation = useMutation({
    mutationFn: bookmarksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsBookmarkModalOpen(false);
      setBookmarkToEdit(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      bookmarksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsBookmarkModalOpen(false);
      setBookmarkToEdit(null);
    },
  });

  const handleOpenNewBookmark = () => {
    setBookmarkToEdit(null);
    setIsBookmarkModalOpen(true);
  };

  const handleSaveBookmark = async (data: {
    title: string;
    url: string;
    description?: string | null;
    folderId?: number | null;
    tags?: string[];
  }) => {
    if (bookmarkToEdit) {
      await updateMutation.mutateAsync({
        id: bookmarkToEdit.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="flex h-screen bg-[#09090B] overflow-hidden font-sans text-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          onNewBookmark={handleOpenNewBookmark}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#09090B]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex-1 max-w-xs w-full bg-[#0C0C0F] h-full">
            <Sidebar
              onNewBookmark={handleOpenNewBookmark}
              closeMobileMenu={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#09090B]">
        {/* Mobile Header */}
        <Navbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onNewBookmark={handleOpenNewBookmark}
        />

        {/* Desktop Top Bar with Toggle and Quick Actions */}
        <header className="hidden md:flex items-center justify-end px-6 py-3 bg-[#0C0C0F]/60 border-b border-[#27272F] backdrop-blur-md">
          <button
            onClick={handleOpenNewBookmark}
            className="px-3 py-1.5 rounded-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-xs transition shadow-[0_2px_8px_rgba(139,92,246,0.25)] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bookmark</span>
          </button>
        </header>

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#09090B]">
          <Outlet
            context={{
              folders,
              tags,
              onOpenNewBookmark: handleOpenNewBookmark,
              onEditBookmark: (bookmark: Bookmark) => {
                setBookmarkToEdit(bookmark);
                setIsBookmarkModalOpen(true);
              },
            }}
          />
        </main>
      </div>

      {/* Global Add/Edit Bookmark Modal */}
      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        bookmarkToEdit={bookmarkToEdit}
        folders={folders}
        availableTags={tags}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsBookmarkModalOpen(false);
          setBookmarkToEdit(null);
        }}
        onSave={handleSaveBookmark}
      />
    </div>
  );
};
