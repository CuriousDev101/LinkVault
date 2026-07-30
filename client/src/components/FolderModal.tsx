import React, { useState } from "react";
import type { Folder } from "../types";
import { X, Folder as FolderIcon } from "lucide-react";

interface FolderModalProps {
  isOpen: boolean;
  folderToEdit?: Folder | null;
  isLoading?: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

const FolderModalInner: React.FC<FolderModalProps> = ({
  folderToEdit,
  isLoading = false,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(folderToEdit ? folderToEdit.name : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#141419] rounded-lg max-w-md w-full shadow-2xl border border-[#27272F] overflow-hidden text-[#FAFAFA]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272F]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#1C1C24] text-[#FBBF24] border border-[#27272F]">
              <FolderIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-[#FAFAFA]">
              {folderToEdit ? "Rename Folder" : "Create New Folder"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#FAFAFA] rounded-md p-1 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              Folder Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Reading List, Dev Tools"
              className="w-full px-3.5 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA] placeholder-[#71717A]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#27272F]">
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
              disabled={isLoading || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-md transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {folderToEdit ? "Save Changes" : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FolderModal: React.FC<FolderModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <FolderModalInner
      key={props.folderToEdit?.id ?? "new-folder"}
      {...props}
    />
  );
};
