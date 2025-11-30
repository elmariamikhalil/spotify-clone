import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { playlists, songs as songsApi } from "../../services/api";
import { PlayerContext } from "../../contexts/PlayerContext";
import {
  Play,
  Pause,
  Clock,
  Plus,
  MoreVertical,
  Trash2,
  Music,
} from "lucide-react";

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { playSong, currentSong, isPlaying, togglePlay } =
    useContext(PlayerContext);

  useEffect(() => {
    loadPlaylist();
    loadAllSongs();
  }, [id]);

  const loadPlaylist = async () => {
    try {
      const { data: songs } = await playlists.getSongs(id);
      setPlaylistSongs(songs);
    } catch (error) {
      console.error("Failed to load playlist:", error);
    }
  };

  const loadAllSongs = async () => {
    const { data } = await songsApi.getAll();
    setAllSongs(data.songs || data);
  };

  const handlePlayClick = (song, index) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, playlistSongs);
    }
  };

  const handleAddSong = async (songId) => {
    try {
      await playlists.addSong(id, songId);
      loadPlaylist();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add song:", error);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await playlists.removeSong(id, songId);
      loadPlaylist();
    } catch (error) {
      console.error("Failed to remove song:", error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (confirm("Delete this playlist? This action cannot be undone.")) {
      try {
        await playlists.delete(id);
        navigate("/library");
      } catch (error) {
        console.error("Failed to delete playlist:", error);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalDuration = playlistSongs.reduce(
    (acc, song) => acc + song.duration,
    0
  );
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="bg-gradient-to-b from-blue-900 via-blue-900/40 to-black min-h-screen pb-32">
      {/* Header */}
      <div className="px-8 pt-20 pb-6 bg-gradient-to-b from-blue-900 to-transparent">
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 bg-gradient-to-br from-blue-400 to-purple-600 rounded shadow-2xl flex items-center justify-center">
            <Music className="w-28 h-28 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">PLAYLIST</p>
            <h1 className="text-white text-7xl font-bold mb-6">
              Playlist #{id}
            </h1>
            <p className="text-white text-sm">
              <span className="font-semibold">
                {playlistSongs.length} songs
              </span>
              {totalDuration > 0 && (
                <span className="text-gray-300">
                  {" • "}
                  {hours > 0 && `${hours} hr `}
                  {minutes} min
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-6 flex items-center gap-6">
        {playlistSongs.length > 0 && (
          <button
            onClick={() => handlePlayClick(playlistSongs[0], 0)}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 hover:bg-green-400 transition shadow-xl"
          >
            {currentSong?.id === playlistSongs[0]?.id && isPlaying ? (
              <Pause className="w-7 h-7 text-black fill-black" />
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </button>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center hover:border-white/40 hover:scale-105 transition"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={handleDeletePlaylist}
          className="text-gray-400 hover:text-red-400 transition"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      {/* Songs List */}
      <div className="px-8">
        {playlistSongs.length > 0 ? (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 border-b border-white/10 mb-2">
              <div className="text-gray-400 text-sm">#</div>
              <div className="text-gray-400 text-sm">TITLE</div>
              <div className="text-gray-400 text-sm">ALBUM</div>
              <div className="flex justify-end">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div></div>
            </div>

            {/* Song Rows */}
            {playlistSongs.map((song, index) => (
              <div
                key={song.id}
                className={`grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-3 rounded-md hover:bg-white/10 group cursor-pointer ${
                  currentSong?.id === song.id ? "bg-white/10" : ""
                }`}
              >
                <div
                  className="flex items-center justify-center"
                  onClick={() => handlePlayClick(song, index)}
                >
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

                <div
                  className="flex items-center gap-3 min-w-0"
                  onClick={() => handlePlayClick(song, index)}
                >
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

                <div
                  className="flex items-center"
                  onClick={() => handlePlayClick(song, index)}
                >
                  <span className="text-sm text-gray-400 truncate">
                    {song.album_title || "Single"}
                  </span>
                </div>

                <div
                  className="flex items-center justify-end"
                  onClick={() => handlePlayClick(song, index)}
                >
                  <span className="text-sm text-gray-400">
                    {formatDuration(song.duration)}
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSong(song.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-white text-2xl font-bold mb-2">
              This playlist is empty
            </h2>
            <p className="text-gray-400 mb-6">Add songs to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition"
            >
              Add Songs
            </button>
          </div>
        )}
      </div>

      {/* Add Song Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-white text-2xl font-bold">
                Add songs to playlist
              </h2>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-6">
              {allSongs.map((song) => {
                const isInPlaylist = playlistSongs.some(
                  (s) => s.id === song.id
                );
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={song.cover_url || "https://via.placeholder.com/40"}
                        alt={song.title}
                        className="w-10 h-10 rounded"
                      />
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">
                          {song.title}
                        </p>
                        <p className="text-gray-400 text-sm truncate">
                          {song.artist_name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddSong(song.id)}
                      disabled={isInPlaylist}
                      className={`px-4 py-2 rounded-full font-semibold transition ${
                        isInPlaylist
                          ? "bg-zinc-700 text-gray-500 cursor-not-allowed"
                          : "bg-white text-black hover:scale-105"
                      }`}
                    >
                      {isInPlaylist ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full bg-white text-black py-3 rounded-full font-bold hover:scale-105 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
