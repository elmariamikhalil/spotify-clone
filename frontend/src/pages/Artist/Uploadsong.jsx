import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { songs } from "../../services/api";
import {
  Upload,
  Music,
  Image,
  Clock,
  X,
  FileAudio,
  CheckCircle,
} from "lucide-react";
import axios from "axios";

export default function UploadSong() {
  const [formData, setFormData] = useState({
    title: "",
    duration: 0,
    file_url: "",
    cover_url: "",
    genre: "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ audio: 0, cover: 0 });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);

      // Get audio duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        setFormData({ ...formData, duration: Math.floor(audio.duration) });
      });
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
    }
  };

  const uploadToCloudinary = async (file, type) => {
    const formData = new FormData();
    formData.append(type === "audio" ? "audio" : "image", file);

    const token = localStorage.getItem("token");
    const endpoint = type === "audio" ? "/upload/audio" : "/upload/image";

    const response = await axios.post(`/api${endpoint}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress((prev) => ({ ...prev, [type]: percentCompleted }));
      },
    });

    return response.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      alert("Please select an audio file");
      return;
    }

    setUploading(true);

    try {
      // Upload audio file
      const audioUrl = await uploadToCloudinary(audioFile, "audio");

      // Upload cover image if provided
      let coverUrl = formData.cover_url;
      if (coverFile) {
        coverUrl = await uploadToCloudinary(coverFile, "cover");
      }

      // Create song with uploaded URLs
      setLoading(true);
      await songs.create({
        ...formData,
        file_url: audioUrl,
        cover_url: coverUrl,
      });

      navigate("/artist");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.error || "Failed to upload song");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const removeAudioFile = () => {
    setAudioFile(null);
    setUploadProgress((prev) => ({ ...prev, audio: 0 }));
  };

  const removeCoverFile = () => {
    setCoverFile(null);
    setUploadProgress((prev) => ({ ...prev, cover: 0 }));
  };

  return (
    <div className="bg-gradient-to-b from-zinc-800 to-black min-h-screen pb-32">
      <div className="max-w-3xl mx-auto px-8 pt-6">
        <div className="mb-8">
          <h1 className="text-white text-5xl font-bold mb-2">
            Upload New Song
          </h1>
          <p className="text-gray-400">Share your music with the world</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/60 backdrop-blur rounded-2xl p-8 border border-white/10"
        >
          {/* Song Title */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-white font-semibold mb-3">
              <Music className="w-5 h-5 text-green-500" />
              Song Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-4 bg-zinc-800 text-white rounded-xl border border-zinc-700 focus:border-green-500 focus:outline-none transition"
              placeholder="Enter song title"
              required
            />
          </div>

          {/* Audio File Upload */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-white font-semibold mb-3">
              <FileAudio className="w-5 h-5 text-green-500" />
              Audio File
            </label>

            {!audioFile ? (
              <div className="relative">
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg"
                  onChange={handleAudioChange}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="w-full p-8 bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-xl hover:border-green-500 transition cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="text-white font-semibold">
                    Click to upload audio file
                  </p>
                  <p className="text-gray-400 text-sm">
                    MP3, WAV, or OGG (max 10MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-white font-semibold">
                        {audioFile.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAudioFile}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {uploadProgress.audio > 0 && uploadProgress.audio < 100 && (
                  <div className="mt-3">
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress.audio}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {uploadProgress.audio}%
                    </p>
                  </div>
                )}
                {uploadProgress.audio === 100 && (
                  <div className="flex items-center gap-2 mt-2 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Upload complete
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cover Image Upload */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-white font-semibold mb-3">
              <Image className="w-5 h-5 text-green-500" />
              Cover Image (Optional)
            </label>

            {!coverFile ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleCoverChange}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="w-full p-6 bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-xl hover:border-green-500 transition cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Image className="w-10 h-10 text-gray-400" />
                  <p className="text-white font-semibold">
                    Click to upload cover image
                  </p>
                  <p className="text-gray-400 text-sm">
                    JPEG, PNG, or WebP (max 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
                <div className="flex items-center gap-4">
                  <img
                    src={URL.createObjectURL(coverFile)}
                    alt="Cover preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">{coverFile.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(coverFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadProgress.cover > 0 && uploadProgress.cover < 100 && (
                      <div className="mt-2">
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress.cover}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeCoverFile}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Duration and Genre Row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-3">
                <Clock className="w-5 h-5 text-green-500" />
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
                className="w-full p-4 bg-zinc-800 text-white rounded-xl border border-zinc-700 focus:border-green-500 focus:outline-none transition"
                placeholder="180"
                required
                min="1"
              />
            </div>

            <div>
              <label className="text-white font-semibold mb-3 block">
                Genre
              </label>
              <select
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                className="w-full p-4 bg-zinc-800 text-white rounded-xl border border-zinc-700 focus:border-green-500 focus:outline-none transition"
              >
                <option value="">Select genre</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="R&B">R&B</option>
                <option value="Electronic">Electronic</option>
                <option value="Jazz">Jazz</option>
                <option value="Classical">Classical</option>
                <option value="Country">Country</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={uploading || loading || !audioFile}
              className="flex-1 bg-green-500 text-black p-4 rounded-full font-bold hover:scale-105 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {uploading
                ? "Uploading..."
                : loading
                ? "Creating..."
                : "Upload Song"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/artist")}
              className="px-8 bg-zinc-700 text-white p-4 rounded-full font-bold hover:bg-zinc-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-8 p-6 bg-blue-900/20 rounded-xl border border-blue-500/20">
          <h3 className="text-white font-semibold mb-2">📝 Upload Guide</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Audio files: MP3, WAV, or OGG format (max 10MB)</li>
            <li>
              • Cover images: JPEG, PNG, or WebP (recommended 640x640px, max
              5MB)
            </li>
            <li>• Duration is auto-detected from audio file</li>
            <li>• Files are securely uploaded to Cloudinary</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
