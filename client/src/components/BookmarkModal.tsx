import React, { useState } from "react";
import type { Bookmark, Folder, Tag } from "../types";
import { X, Plus, Tag as TagIcon, Link as LinkIcon, Folder as FolderIcon } from "lucide-react";

interface BookmarkModalProps {
  isOpen: boolean;
  bookmarkToEdit?: Bookmark | null;
  folders: Folder[];
  availableTags?: Tag[];
  initialFolderId?: number | null;
  initialTag?: string | null;
  isLoading?: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    url: string;
    description?: string | null;
    folderId?: number | null;
    tags?: string[];
  }) => Promise<void>;
}

const BookmarkModalInner: React.FC<BookmarkModalProps> = ({
  bookmarkToEdit,
  folders,
  availableTags = [],
  initialFolderId,
  initialTag,
  isLoading = false,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(bookmarkToEdit ? bookmarkToEdit.title : "");
  const [url, setUrl] = useState(bookmarkToEdit ? bookmarkToEdit.url : "");
  const [description, setDescription] = useState(
    bookmarkToEdit?.description || ""
  );
  const [folderId, setFolderId] = useState<number | null>(
    bookmarkToEdit?.folderId ?? initialFolderId ?? null
  );
  const [tags, setTags] = useState<string[]>(
    bookmarkToEdit?.tags?.map((t) => t.name) ?? (initialTag ? [initialTag] : [])
  );
  const [tagInput, setTagInput] = useState("");
  const [urlError, setUrlError] = useState("");

  const validateUrl = (value: string): boolean => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (!validateUrl(cleanUrl)) {
      setUrlError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }

    setUrlError("");
    await onSave({
      title: title.trim(),
      url: cleanUrl,
      description: description.trim() || null,
      folderId: folderId || null,
      tags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#141419] rounded-lg max-w-lg w-full shadow-2xl border border-[#27272F] overflow-hidden text-[#FAFAFA]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272F]">
          <h2 className="text-base font-semibold text-[#FAFAFA]">
            {bookmarkToEdit ? "Edit Bookmark" : "Add New Bookmark"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#FAFAFA] rounded-md p-1 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Website URL *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (urlError) setUrlError("");
                }}
                placeholder="https://example.com"
                className={`w-full pl-10 pr-4 py-2 text-sm bg-[#09090B] border ${
                  urlError ? "border-[#F87171] focus:ring-[#F87171]/20" : "border-[#27272F] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30"
                } rounded-md outline-hidden transition text-[#FAFAFA] placeholder-[#71717A]`}
              />
            </div>
            {urlError && <p className="mt-1 text-xs text-[#F87171]">{urlError}</p>}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React Official Documentation"
              className="w-full px-3.5 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA] placeholder-[#71717A]"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add brief notes or context..."
              className="w-full px-3.5 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition resize-none text-[#FAFAFA] placeholder-[#71717A]"
            />
          </div>

          {/* Folder Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Folder
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                <FolderIcon className="w-4 h-4" />
              </div>
              <select
                value={folderId || ""}
                onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : null)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA]"
              >
                <option value="">No Folder (Uncategorized)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <TagIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a tag and press Enter"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA] placeholder-[#71717A]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 text-sm font-medium text-[#A1A1AA] bg-[#1C1C24] hover:text-[#FAFAFA] hover:bg-[#27272F] rounded-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Tags list */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#1C1C24] text-[#8B5CF6] border border-[#27272F]"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-[#F87171] transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick suggested tags */}
            {availableTags.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-[#71717A]">
                <span>Suggestions:</span>
                {availableTags
                  .filter((t) => !tags.includes(t.name.toLowerCase()))
                  .slice(0, 5)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTags([...tags, t.name.toLowerCase()])}
                      className="text-[#A1A1AA] hover:text-[#8B5CF6] bg-[#1C1C24] px-1.5 py-0.5 rounded-md cursor-pointer transition border border-[#27272F]"
                    >
                      +{t.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#27272F]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-md transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] flex items-center gap-2 cursor-pointer"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {bookmarkToEdit ? "Update Bookmark" : "Save Bookmark"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BookmarkModal: React.FC<BookmarkModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <BookmarkModalInner
      key={props.bookmarkToEdit?.id ?? "new-bookmark"}
      {...props}
    />
  );
};
