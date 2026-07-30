import React from "react";
import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Bookmark as BookmarkIcon,
  Folder as FolderIcon,
  Tag as TagIcon,
  Settings,
  LogOut,
  Vault,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  onNewBookmark: () => void;
  closeMobileMenu?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewBookmark,
  closeMobileMenu,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "All Bookmarks", to: "/bookmarks", icon: BookmarkIcon },
    { label: "Folders", to: "/folders", icon: FolderIcon },
    { label: "Tags", to: "/tags", icon: TagIcon },
    { label: "Settings", to: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? "w-18" : "w-64"
      } bg-[#0C0C0F] text-[#A1A1AA] flex flex-col h-full border-r border-[#27272F] shrink-0 transition-all duration-200 select-none`}
    >
      {/* Brand Header */}
      <div
        className={`p-3 flex items-center ${
          isCollapsed
            ? "justify-center flex-col gap-2 p-3.5"
            : "justify-between"
        } border-b border-[#27272F]`}
      >
        <NavLink
          to="/"
          onClick={closeMobileMenu}
          title="LinkVault Home"
          className="flex items-center gap-2.5 text-[#FAFAFA] font-bold text-lg tracking-tight hover:opacity-90 transition"
        >
          {!isCollapsed && <span className="tracking-tight">LinkVault</span>}
        </NavLink>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className=" text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        {isCollapsed ? (
          <button
            onClick={() => {
              if (closeMobileMenu) closeMobileMenu();
              onNewBookmark();
            }}
            title="Add Bookmark"
            className="w-10 h-10 mx-auto rounded-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center justify-center transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (closeMobileMenu) closeMobileMenu();
              onNewBookmark();
            }}
            className="w-full py-2 px-3 rounded-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-sm transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bookmark</span>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={closeMobileMenu}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
                } rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-[#1C1C24] text-[#8B5CF6] border border-[#27272F]"
                    : "text-[#A1A1AA] hover:bg-[#141419] hover:text-[#FAFAFA]"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-[#27272F] mt-auto">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              title={user?.name || "User"}
              className="w-8 h-8 rounded-md bg-[#1C1C24] border border-[#27272F] flex items-center justify-center text-xs font-bold text-[#8B5CF6] shrink-0"
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <button
              onClick={() => {
                if (closeMobileMenu) closeMobileMenu();
                logout();
              }}
              title="Log out"
              className="p-1.5 text-[#71717A] hover:text-[#F87171] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-[#1C1C24] border border-[#27272F] flex items-center justify-center text-xs font-bold text-[#8B5CF6] shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#FAFAFA] truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-[#71717A] truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (closeMobileMenu) closeMobileMenu();
                logout();
              }}
              title="Log out"
              className="p-1.5 text-[#71717A] hover:text-[#F87171] hover:bg-[#1C1C24] rounded-md transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
