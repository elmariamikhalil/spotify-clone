import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Disc3, Plus, Edit, Trash2, Music, TrendingUp, X } from "lucide-react";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/artist/albums",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlbums(data);
    } catch (error) {
      console.error("Failed to load albums:", error);
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Delete this album? Songs will remain but will be unlinked from this album."
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/albums/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        loadAlbums();
      } catch (error) {
        alert("Failed to delete album");
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-purple-900/40 via-zinc-900 to-black min-h-screen pb-32">
      <div className="px-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Disc3 className="w-10 h-10 text-purple-500" />
              <h1 className="text-white text-5xl font-bold">My Albums</h1>
            </div>
            <p className="text-gray-400">Organize your songs into albums</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition"
          >
            <Plus className="w-5 h-5" />
            Create Album
          </button>
        </div>

        {/* Albums Grid */}
        {albums.length === 0 ? (
          <div className="text-center py-20">
            <Disc3 className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-6">No albums yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition"
            >
              Create Your First Album
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-zinc-900/60 backdrop-blur p-4 rounded-xl border border-white/10 hover:bg-zinc-800/60 transition group"
              >
                <div className="relative mb-4">
                  <img
                    src={album.cover_url || "https://via.placeholder.com/300"}
                    alt={album.title}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                    <button
                      onClick={() => handleDelete(album.id)}
                      className="p-2 bg-red-500/90 rounded-full hover:bg-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-bold mb-1 truncate">
                  {album.title}
                </h3>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Music className="w-4 h-4" />
                    <span>{album.song_count || 0} songs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{album.total_plays || 0} plays</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  {new Date(album.release_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Album Modal */}
      {showCreateModal && (
        <CreateAlbumModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadAlbums();
          }}
        />
      )}
    </div>
  );
}

function CreateAlbumModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    cover_url: "",
    release_date: new Date().toISOString().split("T")[0],
  });
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadCover = async () => {
    if (!coverFile) return formData.cover_url;

    const data = new FormData();
    data.append("image", coverFile);

    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:5000/api/upload/image",
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
    setLoading(true);

    try {
      const coverUrl = await uploadCover();

      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/albums",
        { ...formData, cover_url: coverUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
    } catch (error) {
      alert("Failed to create album");
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
          <h2 className="text-white text-2xl font-bold">Create New Album</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block">
              Album Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
              placeholder="My Amazing Album"
              required
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
            {coverFile && (
              <img
                src={URL.createObjectURL(coverFile)}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg mt-3"
              />
            )}
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">
              Release Date
            </label>
            <input
              type="date"
              value={formData.release_date}
              onChange={(e) =>
                setFormData({ ...formData, release_date: e.target.value })
              }
              className="w-full p-3 bg-zinc-800 text-white rounded-xl border border-zinc-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 text-white py-3 rounded-full font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Album"}
          </button>
        </form>
      </div>
    </div>
  );
}
