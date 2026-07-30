import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Folder as FolderIcon,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Info,
} from "lucide-react";
import { foldersApi } from "../lib/api";
import type { Folder } from "../types";
import { FolderModal } from "../components/FolderModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";

export const Folders: React.FC = () => {
  const queryClient = useQueryClient();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["folders"],
    queryFn: foldersApi.getAll,
  });

  const folders = data?.folders || [];

  const createFolderMutation = useMutation({
    mutationFn: (name: string) => foldersApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setIsFolderModalOpen(false);
      setFolderToEdit(null);
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      foldersApi.update(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      setIsFolderModalOpen(false);
      setFolderToEdit(null);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: number) => foldersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setFolderToDelete(null);
    },
  });

  const handleOpenCreate = () => {
    setFolderToEdit(null);
    setIsFolderModalOpen(true);
  };

  const handleOpenEdit = (folder: Folder) => {
    setFolderToEdit(folder);
    setIsFolderModalOpen(true);
  };

  const handleSave = async (name: string) => {
    if (folderToEdit) {
      await updateFolderMutation.mutateAsync({ id: folderToEdit.id, name });
    } else {
      await createFolderMutation.mutateAsync(name);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight flex items-center gap-2.5">
            <FolderIcon className="w-6 h-6 text-[#FBBF24]" />
            <span>Folders</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Group your bookmarks into focused collections and project categories.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-sm transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Info Notice about Safe Folder Deletion */}
      <div className="p-4 bg-[#141419] border border-[#27272F] rounded-lg flex items-start gap-3 text-xs text-[#A1A1AA] leading-relaxed">
        <Info className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#FAFAFA]">Safe Folder Deletion:</span> Deleting any folder will never delete the bookmarks inside it. All bookmarks are safely preserved in your vault under "Uncategorized".
        </div>
      </div>

      {/* Folders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 bg-[#141419] rounded-lg border border-[#27272F] p-5 animate-pulse"
            />
          ))}
        </div>
      ) : folders.length === 0 ? (
        <EmptyState
          title="No folders created yet"
          description="Create folders to group related bookmarks by topic, project, or workflow."
          actionLabel="Create First Folder"
          onAction={handleOpenCreate}
          icon={<FolderIcon className="w-6 h-6 text-[#FBBF24]" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="group bg-[#141419] rounded-lg p-5 border border-[#27272F] hover:border-[#3F3F46] hover:bg-[#16161D] transition duration-150 flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-[#1C1C24] text-[#FBBF24] border border-[#27272F] flex items-center justify-center shrink-0">
                    <FolderIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/bookmarks?folderId=${folder.id}`}
                      className="font-semibold text-[#FAFAFA] group-hover:text-[#8B5CF6] transition block truncate text-base"
                    >
                      {folder.name}
                    </Link>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      {folder.bookmarkCount} {folder.bookmarkCount === 1 ? "bookmark" : "bookmarks"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(folder)}
                    title="Rename Folder"
                    className="p-1.5 text-[#71717A] hover:text-[#8B5CF6] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setFolderToDelete(folder)}
                    title="Delete Folder"
                    className="p-1.5 text-[#71717A] hover:text-[#F87171] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#27272F] flex items-center justify-between">
                <Link
                  to={`/bookmarks?folderId=${folder.id}`}
                  className="text-xs font-semibold text-[#8B5CF6] hover:text-[#7C3AED] transition flex items-center gap-1"
                >
                  <span>View Bookmarks</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <span className="text-[11px] text-[#71717A]">
                  {new Date(folder.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Folder Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        folderToEdit={folderToEdit}
        isLoading={createFolderMutation.isPending || updateFolderMutation.isPending}
        onClose={() => {
          setIsFolderModalOpen(false);
          setFolderToEdit(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Folder Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!folderToDelete}
        title="Delete Folder"
        message={`Are you sure you want to delete the folder "${folderToDelete?.name}"? Its ${folderToDelete?.bookmarkCount || 0} bookmarks will be preserved as uncategorized bookmarks.`}
        confirmLabel="Delete Folder"
        isLoading={deleteFolderMutation.isPending}
        onConfirm={() => {
          if (folderToDelete) {
            deleteFolderMutation.mutate(folderToDelete.id);
          }
        }}
        onCancel={() => setFolderToDelete(null)}
      />
    </div>
  );
};
