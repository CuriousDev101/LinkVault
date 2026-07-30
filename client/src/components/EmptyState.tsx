import React from "react";
import { FolderSearch, Plus } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No bookmarks found",
  description = "Try adjusting your search or filters, or add a new bookmark to get started.",
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#141419]/40 rounded-lg border border-dashed border-[#27272F] text-[#FAFAFA]">
      <div className="w-12 h-12 mb-3.5 rounded-md bg-[#1C1C24] border border-[#27272F] text-[#8B5CF6] flex items-center justify-center">
        {icon || <FolderSearch className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-[#FAFAFA] mb-1">{title}</h3>
      <p className="text-sm text-[#A1A1AA] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-md transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
