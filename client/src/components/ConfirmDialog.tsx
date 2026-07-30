import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmBtnStyles =
    variant === "danger"
      ? "bg-[#F87171] hover:bg-red-500 text-white"
      : "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-[0_2px_10px_rgba(139,92,246,0.25)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#141419] rounded-lg max-w-md w-full shadow-2xl border border-[#27272F] overflow-hidden text-[#FAFAFA]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-md ${
                  variant === "danger"
                    ? "bg-[#1C1C24] text-[#F87171] border border-[#F87171]/20"
                    : "bg-[#1C1C24] text-[#FBBF24] border border-[#FBBF24]/20"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#FAFAFA]">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-[#71717A] hover:text-[#FAFAFA] rounded-md p-1 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-[#A1A1AA] leading-relaxed mb-6">{message}</p>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md transition shadow-sm cursor-pointer flex items-center gap-2 ${confirmBtnStyles}`}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
