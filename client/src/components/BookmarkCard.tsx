import React from "react";
import type { Bookmark } from "../types";
import {
  ExternalLink,
  Edit2,
  Trash2,
  Folder as FolderIcon,
  Tag as TagIcon,
  Globe,
  Clock,
} from "lucide-react";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
  onTagClick?: (tagName: string) => void;
  onFolderClick?: (folderId: number) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onEdit,
  onDelete,
  onTagClick,
  onFolderClick,
}) => {
  // Extract hostname for favicon and display
  let hostname = "";
  try {
    hostname = new URL(bookmark.url).hostname;
  } catch {
    hostname = bookmark.url;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="group relative bg-[#141419] rounded-lg p-5 border border-[#27272F] hover:border-[#3F3F46] hover:bg-[#16161D] transition duration-150 flex flex-col justify-between shadow-sm">
      <div>
        {/* Top Header: Hostname & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#1C1C24] border border-[#27272F] flex items-center justify-center shrink-0 overflow-hidden text-[#71717A]">
              <img
                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                alt=""
                className="w-4 h-4"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-[#71717A] truncate">
              {hostname}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(bookmark)}
              title="Edit Bookmark"
              className="p-1.5 text-[#71717A] hover:text-[#8B5CF6] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(bookmark)}
              title="Delete Bookmark"
              className="p-1.5 text-[#71717A] hover:text-[#F87171] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Link */}
        <div className="mb-2">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-[#FAFAFA] group-hover:text-[#8B5CF6] transition flex items-start gap-1.5 line-clamp-2"
          >
            <span>{bookmark.title}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-1 opacity-50 group-hover:opacity-100" />
          </a>
        </div>

        {/* Description */}
        {bookmark.description && (
          <p className="text-xs text-[#A1A1AA] line-clamp-2 mb-4 leading-relaxed">
            {bookmark.description}
          </p>
        )}
      </div>

      {/* Footer: Folder, Tags, Dates */}
      <div className="pt-3 border-t border-[#27272F] mt-2 space-y-2.5">
        {/* Folder & Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {bookmark.folderName && bookmark.folderId && (
            <button
              onClick={() => onFolderClick && onFolderClick(bookmark.folderId!)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#1C1C24] text-[#FBBF24] border border-[#FBBF24]/20 hover:border-[#FBBF24]/40 transition cursor-pointer"
            >
              <FolderIcon className="w-3 h-3" />
              <span>{bookmark.folderName}</span>
            </button>
          )}

          {bookmark.tags &&
            bookmark.tags.map((t) => (
              <button
                key={t.id}
                onClick={() => onTagClick && onTagClick(t.name)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#1C1C24] text-[#A1A1AA] border border-[#27272F] hover:text-[#8B5CF6] hover:border-[#8B5CF6]/40 transition cursor-pointer"
              >
                <TagIcon className="w-2.5 h-2.5" />
                <span>{t.name}</span>
              </button>
            ))}
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[11px] text-[#71717A]">
          <span className="flex items-center gap-1" title={`Updated: ${formatDate(bookmark.updatedAt)}`}>
            <Clock className="w-3 h-3" />
            Added {formatDate(bookmark.createdAt)}
          </span>
          {bookmark.updatedAt !== bookmark.createdAt && (
            <span className="italic">Edited</span>
          )}
        </div>
      </div>
    </div>
  );
};
