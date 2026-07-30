import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag as TagIcon, Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { tagsApi } from "../lib/api";
import type { Tag } from "../types";
import { TagModal } from "../components/TagModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";

export const Tags: React.FC = () => {
  const queryClient = useQueryClient();

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: tagsApi.getAll,
  });

  const tags = data?.tags || [];

  const createTagMutation = useMutation({
    mutationFn: (name: string) => tagsApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setIsTagModalOpen(false);
      setTagToEdit(null);
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      tagsApi.update(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      setIsTagModalOpen(false);
      setTagToEdit(null);
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setTagToDelete(null);
    },
  });

  const handleOpenCreate = () => {
    setTagToEdit(null);
    setIsTagModalOpen(true);
  };

  const handleOpenEdit = (tag: Tag) => {
    setTagToEdit(tag);
    setIsTagModalOpen(true);
  };

  const handleSave = async (name: string) => {
    if (tagToEdit) {
      await updateTagMutation.mutateAsync({ id: tagToEdit.id, name });
    } else {
      await createTagMutation.mutateAsync(name);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight flex items-center gap-2.5">
            <TagIcon className="w-6 h-6 text-[#8B5CF6]" />
            <span>Tags</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Label and cross-reference your bookmarks with flexible keywords.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-sm transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Tag</span>
        </button>
      </div>

      {/* Tags Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-24 bg-[#141419] rounded-lg border border-[#27272F] p-4 animate-pulse"
            />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <EmptyState
          title="No tags created yet"
          description="Tags help you categorize bookmarks with custom keywords across folders."
          actionLabel="Create First Tag"
          onAction={handleOpenCreate}
          icon={<TagIcon className="w-6 h-6 text-[#8B5CF6]" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="group bg-[#141419] rounded-lg p-4 border border-[#27272F] hover:border-[#3F3F46] hover:bg-[#16161D] transition duration-150 flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to={`/bookmarks?tagName=${encodeURIComponent(tag.name)}`}
                    className="font-semibold text-[#FAFAFA] group-hover:text-[#8B5CF6] transition block truncate text-base"
                  >
                    #{tag.name}
                  </Link>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    {tag.bookmarkCount || 0} {(tag.bookmarkCount || 0) === 1 ? "bookmark" : "bookmarks"}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(tag)}
                    title="Rename Tag"
                    className="p-1.5 text-[#71717A] hover:text-[#8B5CF6] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTagToDelete(tag)}
                    title="Delete Tag"
                    className="p-1.5 text-[#71717A] hover:text-[#F87171] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#27272F] flex items-center justify-between">
                <Link
                  to={`/bookmarks?tagName=${encodeURIComponent(tag.name)}`}
                  className="text-xs font-semibold text-[#8B5CF6] hover:text-[#7C3AED] transition flex items-center gap-1"
                >
                  <span>Filter Bookmarks</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tag Modal */}
      <TagModal
        isOpen={isTagModalOpen}
        tagToEdit={tagToEdit}
        isLoading={createTagMutation.isPending || updateTagMutation.isPending}
        onClose={() => {
          setIsTagModalOpen(false);
          setTagToEdit(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Tag Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!tagToDelete}
        title="Delete Tag"
        message={`Are you sure you want to delete the tag "#${tagToDelete?.name}"? It will be removed from all associated bookmarks.`}
        confirmLabel="Delete Tag"
        isLoading={deleteTagMutation.isPending}
        onConfirm={() => {
          if (tagToDelete) {
            deleteTagMutation.mutate(tagToDelete.id);
          }
        }}
        onCancel={() => setTagToDelete(null)}
      />
    </div>
  );
};
