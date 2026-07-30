import React from "react";
import { Menu, Plus, Vault } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onNewBookmark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onNewBookmark,
}) => {
  const { user } = useAuth();

  return (
    <header className="md:hidden bg-[#0C0C0F] border-b border-[#27272F] text-[#FAFAFA] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle menu"
          className="p-1.5 text-[#A1A1AA] hover:text-[#FAFAFA] rounded-md hover:bg-[#1C1C24] transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 font-bold text-base text-[#FAFAFA]">
          <div className="w-7 h-7 rounded-md bg-[#8B5CF6] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(139,92,246,0.25)]">
            <Vault className="w-4 h-4" />
          </div>
          <span>LinkVault</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewBookmark}
          className="p-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-md transition shadow-[0_2px_8px_rgba(139,92,246,0.25)] cursor-pointer"
          title="Add Bookmark"
        >
          <Plus className="w-4 h-4" />
        </button>
        <Link
          to="/settings"
          className="w-7 h-7 rounded-md bg-[#1C1C24] border border-[#27272F] flex items-center justify-center text-xs font-bold text-[#8B5CF6]"
        >
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </Link>
      </div>
    </header>
  );
};
