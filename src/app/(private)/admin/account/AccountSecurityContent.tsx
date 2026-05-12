"use client";

import { createClient } from "@/lib/supabase/client";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

interface AccountSecurityContentProps {
  currentEmail: string;
}

export default function AccountSecurityContent({
  currentEmail,
}: AccountSecurityContentProps) {
  const [knownEmail, setKnownEmail] = useState(currentEmail);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Please enter a new email address");
      return;
    }

    if (normalizedEmail === knownEmail.toLowerCase()) {
      toast.error("Please use a different email address");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({
        email: normalizedEmail,
      });

      if (error) {
        toast.error(error.message || "Failed to update email");
        return;
      }

      setKnownEmail(data.user?.email || knownEmail);
      setNewEmail("");
      toast.success(
        "Email update requested. Please confirm from your email inbox.",
      );
    } catch {
      toast.error("Unexpected error while updating email");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        toast.error("Unable to verify current account");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message || "Failed to update password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch {
      toast.error("Unexpected error while updating password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Account Security
          </h1>
          <p className="text-gray-600 mt-2">
            Update your admin email and password securely.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">
              Change Email
            </h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Current email:{" "}
            <span className="font-medium text-gray-900">{knownEmail}</span>
          </p>

          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <label
                htmlFor="newEmail"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New email address
              </label>
              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingEmail}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingEmail ? "Updating email..." : "Update Email"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">
              Change Password
            </h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="current-password"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use at least 8 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingPassword ? "Updating password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
