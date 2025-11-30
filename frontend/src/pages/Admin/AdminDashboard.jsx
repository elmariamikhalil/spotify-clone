import { useState, useEffect } from "react";
import { admin, songs as songsApi } from "../../services/api";
import {
  Users,
  Music,
  TrendingUp,
  CheckCircle,
  XCircle,
  Shield,
  Upload,
  Trash2,
  Edit,
  Plus,
  X,
} from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: platformStats } = await admin.getStats();
    const { data: userList } = await admin.getUsers();
    const { data: artistList } = await admin.getArtists();
    const { data: songData } = await songsApi.getAll();
    setStats(platformStats);
    setUsers(userList);
    setArtists(artistList);
    setSongs(songData.songs || songData);
  };

  const handleVerifyArtist = async (id, verified) => {
    await admin.verifyArtist(id, !verified);
    loadData();
  };

  const handleDeleteUser = async (id) => {
    if (confirm("Delete this user? This action cannot be undone.")) {
      await admin.deleteUser(id);
      loadData();
    }
  };

  const handleDeleteSong = async (id) => {
    if (confirm("Delete this song? This action cannot be undone.")) {
      try {
        await songsApi.delete(id);
        loadData();
      } catch (error) {
        alert("Failed to delete song");
      }
    }
  };

  const handleEditSong = (song) => {
    setEditingSong(song);
    setShowEditModal(true);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  return (
    <div className="bg-gradient-to-b from-red-900/40 via-zinc-900 to-black min-h-screen pb-32">
      <div className="px-8 pt-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-red-500" />
            <h1 className="text-white text-5xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400">Platform management and analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Users</p>
            <p className="text-white text-4xl font-bold">
              {formatNumber(stats?.users || 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Music className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Artists</p>
            <p className="text-white text-4xl font-bold">
              {formatNumber(stats?.artists || 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Music className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Songs</p>
            <p className="text-white text-4xl font-bold">
              {formatNumber(stats?.songs || 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Plays</p>
            <p className="text-white text-4xl font-bold">
              {formatNumber(stats?.totalPlays || 0)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === "overview"
                ? "text-white border-green-500"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("songs")}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === "songs"
                ? "text-white border-green-500"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Songs ({songs.length})
          </button>
          <button
            onClick={() => setActiveTab("artists")}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === "artists"
                ? "text-white border-green-500"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Artists ({artists.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === "users"
                ? "text-white border-green-500"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        {/* Songs Tab */}
        {activeTab === "songs" && (
          <div className="bg-zinc-900/40 backdrop-blur rounded-xl overflow-hidden border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-white text-2xl font-bold">
                  Content Management
                </h2>
                <p className="text-gray-400 text-sm">
                  Manage all songs on the platform
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 bg-green-500 text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition"
              >
                <Plus className="w-5 h-5" />
                Upload Song
              </button>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-6 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={song.cover_url || "https://via.placeholder.com/60"}
                      alt={song.title}
                      className="w-16 h-16 rounded"
                    />
                    <div>
                      <p className="text-white font-semibold">{song.title}</p>
                      <p className="text-gray-400 text-sm">
                        {song.artist_name} • {song.genre || "Unknown"}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatNumber(song.plays)} plays
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditSong(song)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSong(song.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artists Tab */}
        {activeTab === "artists" && (
          <div className="bg-zinc-900/40 backdrop-blur rounded-xl overflow-hidden border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-white text-2xl font-bold">
                Artist Management
              </h2>
              <p className="text-gray-400 text-sm">
                Verify artists and manage their accounts
              </p>
            </div>
            <div className="divide-y divide-white/10">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-6 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">
                          {artist.artist_name}
                        </p>
                        {artist.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{artist.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleVerifyArtist(artist.id, artist.verified)
                    }
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition ${
                      artist.verified
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        : "bg-zinc-700 text-gray-300 hover:bg-zinc-600"
                    }`}
                  >
                    {artist.verified ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Verify Artist
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-zinc-900/40 backdrop-blur rounded-xl overflow-hidden border border-white/10">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-white text-2xl font-bold">User Management</h2>
              <p className="text-gray-400 text-sm">
                View and manage all platform users
              </p>
            </div>
            <div className="divide-y divide-white/10">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-6 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {user.username}
                      </p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        user.role === "admin"
                          ? "bg-red-500/20 text-red-400"
                          : user.role === "artist"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {user.role}
                    </span>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-600/20 text-red-400 px-6 py-3 rounded-full font-semibold hover:bg-red-600/30 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/40 backdrop-blur rounded-xl p-6 border border-white/10">
              <h2 className="text-white text-2xl font-bold mb-4">
                Platform Overview
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Users</p>
                  <p className="text-white text-3xl font-bold">
                    {stats?.users || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Artists</p>
                  <p className="text-white text-3xl font-bold">
                    {stats?.artists || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Songs</p>
                  <p className="text-white text-3xl font-bold">
                    {stats?.songs || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Plays</p>
                  <p className="text-white text-3xl font-bold">
                    {formatNumber(stats?.totalPlays || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-zinc-900/40 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4">
                  Verified Artists
                </h3>
                <p className="text-gray-400">
                  {artists.filter((a) => a.verified).length} of {artists.length}{" "}
                  artists verified
                </p>
              </div>
              <div className="bg-zinc-900/40 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4">User Roles</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">
                    Admins: {users.filter((u) => u.role === "admin").length}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Artists: {users.filter((u) => u.role === "artist").length}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Users: {users.filter((u) => u.role === "user").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadSongModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            loadData();
          }}
          artists={artists}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingSong && (
        <EditSongModal
          song={editingSong}
          onClose={() => {
            setShowEditModal(false);
            setEditingSong(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingSong(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Upload Song Modal Component
function UploadSongModal({ onClose, onSuccess, artists }) {
  const [formData, setFormData] = useState({
    title: "",
    duration: 0,
    file_url: "",
    cover_url: "",
    genre: "",
    artist_id: "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        setFormData({ ...formData, duration: Math.floor(audio.duration) });
      });
    }
  };

  const uploadToCloudinary = async (file, type) => {
    const data = new FormData();
    data.append(type === "audio" ? "audio" : "image", file);

    const token = localStorage.getItem("token");
    const endpoint = type === "audio" ? "/upload/audio" : "/upload/image";

    const response = await axios.post(
      `http://localhost:5000/api${endpoint}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let audioUrl = formData.file_url;
      let coverUrl = formData.cover_url;

      if (audioFile) {
        audioUrl = await uploadToCloudinary(audioFile, "audio");
      }

      if (coverFile) {
        coverUrl = await uploadToCloudinary(coverFile, "cover");
      }

      await songsApi.create({
        ...formData,
        file_url: audioUrl,
        cover_url: coverUrl,
      });

      onSuccess();
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white text-2xl font-bold">Upload New Song</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block">
              Select Artist
            </label>
            <select
              value={formData.artist_id}
              onChange={(e) =>
                setFormData({ ...formData, artist_id: e.target.value })
              }
              className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
              required
            >
              <option value="">Choose an artist</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.artist_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">
              Song Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
              required
            />
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">
              Audio File
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
            />
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white font-semibold mb-2 block">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
                required
              />
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block">
                Genre
              </label>
              <select
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
              >
                <option value="">Select genre</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="R&B">R&B</option>
                <option value="Electronic">Electronic</option>
                <option value="Jazz">Jazz</option>
                <option value="Classical">Classical</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-green-500 text-black py-3 rounded-full font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Song"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Edit Song Modal Component
function EditSongModal({ song, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: song.title,
    genre: song.genre,
    cover_url: song.cover_url,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await songsApi.update(song.id, formData);
      onSuccess();
    } catch (error) {
      alert("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white text-2xl font-bold">Edit Song</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
            />
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">Genre</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) =>
                setFormData({ ...formData, genre: e.target.value })
              }
              className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
            />
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">
              Cover URL
            </label>
            <input
              type="url"
              value={formData.cover_url}
              onChange={(e) =>
                setFormData({ ...formData, cover_url: e.target.value })
              }
              className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-black py-3 rounded-full font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
