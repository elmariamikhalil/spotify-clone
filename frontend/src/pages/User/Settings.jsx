import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { User, Mail, Lock, Save, Trash2, Download } from "lucide-react";
import axios from "axios";

export default function Settings() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/user/profile",
        {
          username: formData.username,
          email: formData.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/user/password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: "Password changed successfully!" });
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Password change failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/export/user-data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Download as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `spotify-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();

      setMessage({ type: "success", text: "Data exported successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Export failed" });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== "DELETE") {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete("/api/user/account", {
        headers: { Authorization: `Bearer ${token}` },
      });

      logout();
      window.location.href = "/login";
    } catch (error) {
      setMessage({ type: "error", text: "Account deletion failed" });
    }
  };

  return (
    <div className="bg-gradient-to-b from-zinc-800 to-black min-h-screen pb-32">
      <div className="max-w-4xl mx-auto px-8 pt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-5xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === "profile"
                ? "text-white border-green-500"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === "security"
                ? "text-white border-green-500"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === "privacy"
                ? "text-white border-green-500"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Privacy & Data
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-zinc-900/60 backdrop-blur rounded-2xl p-8 border border-white/10">
            <h2 className="text-white text-2xl font-bold mb-6">
              Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <User className="w-5 h-5 text-green-500" />
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full p-4 bg-zinc-800 text-white rounded-xl border border-zinc-700 focus:border-green-500 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Mail className="w-5 h-5 text-green-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-4 bg-zinc-800 text-white rounded-xl border border-zinc-700 focus:border-green-500 focus:outline-none transition"
                  required
                />
              </div>

              <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-400 text-sm">
                  <strong>Account Type:</strong>{" "}
                  {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-green-500 text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-zinc-900/60 backdrop-blur rounded-2xl p-8 border border-white/10">
            <h2 className="text-white text-2xl font-bold mb-6">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Lock className="w-5 h-5 text-green-500" />
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full p-4 bg-zinc-800 text-white rounded-xl border border-zinc-700 focus:border-green-500 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Lock className="w-5 h-5 text-green-500" />
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full p-4 bg-zinc-800 text-white rounded-xl border border-zinc-700 focus:border-green-500 focus:outline-none transition"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Lock className="w-5 h-5 text-green-500" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full p-4 bg-zinc-800 text-white rounded-xl border border-zinc-700 focus:border-green-500 focus:outline-none transition"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-green-500 text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        )}

        {/* Privacy & Data Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 backdrop-blur rounded-2xl p-8 border border-white/10">
              <h2 className="text-white text-2xl font-bold mb-4">
                Export Your Data
              </h2>
              <p className="text-gray-400 mb-6">
                Download a copy of all your data including playlists, liked
                songs, and listening history.
              </p>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition"
              >
                <Download className="w-5 h-5" />
                Export Data
              </button>
            </div>

            <div className="bg-red-900/20 backdrop-blur rounded-2xl p-8 border border-red-500/30">
              <h2 className="text-white text-2xl font-bold mb-4">
                Danger Zone
              </h2>
              <p className="text-gray-400 mb-6">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
