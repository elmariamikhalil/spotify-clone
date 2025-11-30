import { useState, useEffect, useContext } from "react";
import { likes } from "../../services/api";
import { PlayerContext } from "../../contexts/Playercontext";
import { Play, Pause, Heart, Clock } from "lucide-react";

export default function LikedSongs() {
  const [likedSongs, setLikedSongs] = useState([]);
  const { playSong, currentSong, isPlaying, togglePlay } =
    useContext(PlayerContext);

  useEffect(() => {
    loadLikedSongs();
  }, []);

  const loadLikedSongs = async () => {
    try {
      const { data } = await likes.getAll();
      setLikedSongs(data);
    } catch (error) {
      console.error("Failed to load liked songs:", error);
    }
  };

  const handlePlayClick = (song, index) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, likedSongs);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gradient-to-b from-purple-900 via-purple-900/40 to-black min-h-screen pb-32">
      {/* Header */}
      <div className="px-8 pt-20 pb-6 bg-gradient-to-b from-purple-900 to-transparent">
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 bg-gradient-to-br from-purple-400 to-blue-600 rounded shadow-2xl flex items-center justify-center">
            <Heart className="w-28 h-28 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">PLAYLIST</p>
            <h1 className="text-white text-7xl font-bold mb-6">Liked Songs</h1>
            <p className="text-white text-sm">
              <span className="font-semibold">{likedSongs.length} songs</span>
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-6 flex items-center gap-6">
        {likedSongs.length > 0 && (
          <button
            onClick={() => handlePlayClick(likedSongs[0], 0)}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition shadow-xl"
          >
            {currentSong?.id === likedSongs[0]?.id && isPlaying ? (
              <Pause className="w-7 h-7 text-black fill-black" />
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </button>
        )}
      </div>

      {/* Songs List */}
      <div className="px-8">
        {likedSongs.length > 0 ? (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 border-b border-white/10 mb-2">
              <div className="text-gray-400 text-sm">#</div>
              <div className="text-gray-400 text-sm">TITLE</div>
              <div className="text-gray-400 text-sm">DATE ADDED</div>
              <div className="flex justify-end">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Song Rows */}
            {likedSongs.map((song, index) => (
              <div
                key={song.id}
                onClick={() => handlePlayClick(song, index)}
                className={`grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-3 rounded-md hover:bg-white/10 group cursor-pointer ${
                  currentSong?.id === song.id ? "bg-white/10" : ""
                }`}
              >
                <div className="flex items-center justify-center">
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className="w-4 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        <span className="w-0.5 h-4 bg-green-500 animate-pulse"></span>
                        <span
                          className="w-0.5 h-4 bg-green-500 animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></span>
                        <span
                          className="w-0.5 h-4 bg-green-500 animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></span>
                      </div>
                    </div>
                  ) : (
                    <span
                      className={`text-sm ${
                        currentSong?.id === song.id
                          ? "text-green-500"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={song.cover_url || "https://via.placeholder.com/40"}
                    alt={song.title}
                    className="w-10 h-10 rounded"
                  />
                  <div className="min-w-0">
                    <p
                      className={`font-medium truncate ${
                        currentSong?.id === song.id
                          ? "text-green-500"
                          : "text-white"
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {song.artist_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="text-sm text-gray-400">
                    {formatDate(song.liked_at)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <Heart className="w-4 h-4 text-green-500 fill-green-500 opacity-0 group-hover:opacity-100" />
                  <span className="text-sm text-gray-400">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-white text-2xl font-bold mb-2">
              Songs you like will appear here
            </h2>
            <p className="text-gray-400 mb-6">
              Save songs by tapping the heart icon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
