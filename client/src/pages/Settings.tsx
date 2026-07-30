import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../lib/api";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";

export const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword && newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const data = await authApi.updateProfile({
        name: name !== user?.name ? name : undefined,
        email: email !== user?.email ? email : undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      updateUser(data.user);
      setMessage("Profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-[#71717A]" />
          <span>Account Settings</span>
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Manage your personal profile, credentials, and session.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-[#1C1C24] border border-[#34D399]/30 rounded-md flex items-center gap-3 text-[#34D399] text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#1C1C24] border border-[#F87171]/30 rounded-md flex items-center gap-3 text-[#F87171] text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-[#141419] rounded-lg border border-[#27272F] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#27272F]">
          <h2 className="text-base font-semibold text-[#FAFAFA]">User Information</h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Update your account contact details.
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#27272F]">
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-1">
              Change Password
            </h3>
            <p className="text-xs text-[#71717A] mb-4">
              Leave blank if you don't wish to change your password.
            </p>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA] placeholder-[#71717A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA] placeholder-[#71717A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-[#09090B] border border-[#27272F] rounded-md outline-hidden focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition text-[#FAFAFA] placeholder-[#71717A]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#27272F]">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-md transition shadow-[0_2px_10px_rgba(139,92,246,0.25)] cursor-pointer flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Logout Box */}
      <div className="bg-[#141419] rounded-lg border border-[#F87171]/20 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#FAFAFA]">Sign Out</h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            End your current session on this device.
          </p>
        </div>
        <button
          onClick={() => setIsLogoutConfirmOpen(true)}
          className="px-4 py-2 rounded-md text-sm font-medium text-[#F87171] hover:bg-[#F87171]/10 border border-[#F87171]/30 transition cursor-pointer flex items-center gap-2 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of LinkVault?"
        confirmLabel="Sign Out"
        variant="warning"
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
};
