"use client";

import { withAuth } from "@workos-inc/authkit-nextjs";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

interface UserProfile {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const { user: authUser } = await withAuth();
        setUser(authUser);
        if (authUser) {
          setProfile({
            email: authUser.email || "",
            phone: "", // Phone would come from your database
            firstName: authUser.firstName || "",
            lastName: authUser.lastName || "",
          });
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      // TODO: Save to your database via Convex mutation
      // For now, we'll just simulate a save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (error) {
      console.error("Save error:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-electric animate-pulse">
          Loading account information...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-electric mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-400 mb-8">
            Please sign in to access your account
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, x: 2, y: -2 }}
              whileTap={{
                scale: 0.95,
                backgroundColor: "#00ffff",
                color: "#000000",
              }}
              className="px-6 py-3 border border-electric text-electric hover:bg-electric/10 transition-all"
            >
              Go to Home
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-electric mb-8 text-center">
          Account Settings
        </h1>

        <div className="border border-electric/30 p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-electric">
              Profile Information
            </h2>
            {!editing && (
              <motion.button
                whileHover={{ scale: 1.05, x: 2, y: -2 }}
                whileTap={{
                  scale: 0.95,
                  backgroundColor: "#00ffff",
                  color: "#000000",
                }}
                className="px-4 py-2 border border-electric text-electric hover:bg-electric/10 transition-all"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </motion.button>
            )}
          </div>

          {message && (
            <div
              className={`p-3 mb-4 border ${
                message.includes("success")
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                disabled={!editing}
                className="w-full px-4 py-3 bg-black border border-electric/30 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-electric"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                disabled={!editing}
                className="w-full px-4 py-3 bg-black border border-electric/30 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-electric"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                disabled={!editing}
                className="w-full px-4 py-3 bg-black border border-electric/30 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-electric"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                disabled={!editing}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 bg-black border border-electric/30 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-electric placeholder-gray-600"
              />
            </div>
          </div>

          {editing && (
            <div className="flex gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05, x: 2, y: -2 }}
                whileTap={{
                  scale: 0.95,
                  backgroundColor: "#00ffff",
                  color: "#000000",
                }}
                className="px-6 py-3 border border-electric text-electric hover:bg-electric/10 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, x: 2, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border border-gray-500 text-gray-500 hover:bg-gray-500/10 transition-all duration-100"
                onClick={() => {
                  setEditing(false);
                  setMessage("");
                  // Reset to original values
                  setProfile({
                    email: user.email || "",
                    phone: "",
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                  });
                }}
                disabled={saving}
              >
                Cancel
              </motion.button>
            </div>
          )}
        </div>

        <div className="border border-electric/30 p-8">
          <h2 className="text-2xl font-bold text-electric mb-4">Account ID</h2>
          <p className="text-gray-400 font-mono text-sm break-all">{user.id}</p>
        </div>
      </div>
    </div>
  );
}
