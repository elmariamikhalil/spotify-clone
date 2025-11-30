import { useState, useEffect, useContext } from "react";
import { PlayerContext } from "../../contexts/PlayerContext";
import axios from "axios";
import {
  Clock,
  Calendar,
  TrendingUp,
  Music,
  User,
  BarChart3,
  Play,
  Pause,
} from "lucide-react";

export default function History() {
  const [stats, setStats] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [period, setPeriod] = useState("30");
  const { playSong, currentSong, isPlaying, togglePlay } =
    useContext(PlayerContext);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const [statsRes, recentRes, topSongsRes, topArtistsRes] =
        await Promise.all([
          axios.get(
            `http://localhost:5000/api/history/stats?period=${period}`,
            config
          ),
          axios.get(
            "http://localhost:5000/api/history/recent?limit=10",
            config
          ),
          axios.get(
            `http://localhost:5000/api/history/top-songs?period=${period}&limit=10`,
            config
          ),
          axios.get(
            `http://localhost:5000/api/history/top-artists?period=${period}&limit=5`,
            config
          ),
        ]);

      setStats(statsRes.data);
      setRecentlyPlayed(recentRes.data);
      setTopSongs(topSongsRes.data);
      setTopArtists(topArtistsRes.data);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handlePlay = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, topSongs);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-b from-indigo-900/40 via-zinc-900 to-black min-h-screen pb-32">
      <div className="px-8 pt-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-10 h-10 text-indigo-500" />
            <h1 className="text-white text-5xl font-bold">Listening History</h1>
          </div>
          <p className="text-gray-400">Your music journey at a glance</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-3 mb-8">
          {["7", "30", "90", "365"].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                period === days
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
              }`}
            >
              Last {days === "365" ? "1 year" : `${days} days`}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Total Plays</p>
            <p className="text-white text-4xl font-bold">
              {stats?.total_plays || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <Clock className="w-8 h-8 text-blue-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Minutes Listened</p>
            <p className="text-white text-4xl font-bold">
              {stats?.total_minutes || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <Music className="w-8 h-8 text-green-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Unique Songs</p>
            <p className="text-white text-4xl font-bold">
              {stats?.unique_songs || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <User className="w-8 h-8 text-orange-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Unique Artists</p>
            <p className="text-white text-4xl font-bold">
              {stats?.unique_artists || 0}
            </p>
          </div>
        </div>

        {stats?.top_genre && (
          <div className="bg-zinc-900/60 backdrop-blur p-6 rounded-xl border border-white/10 mb-10">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-500" />
              <div>
                <p className="text-gray-400 text-sm">Your Top Genre</p>
                <p className="text-white text-2xl font-bold">
                  {stats.top_genre}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recently Played */}
          <div className="bg-zinc-900/40 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-white text-2xl font-bold">Recently Played</h2>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {recentlyPlayed.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                      <img
                        src={song.cover_url || "https://via.placeholder.com/50"}
                        alt={song.title}
                        className="w-12 h-12 rounded"
                      />
                      <button
                        onClick={() => handlePlay(song)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        {currentSong?.id === song.id && isPlaying ? (
                          <Pause className="w-5 h-5 text-white fill-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-white" />
                        )}
                      </button>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{song.title}</p>
                      <p className="text-gray-400 text-sm">
                        {song.artist_name}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(song.played_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Songs */}
          <div className="bg-zinc-900/40 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-white text-2xl font-bold">Top Songs</h2>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {topSongs.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-gray-400 font-bold text-lg w-6">
                      {index + 1}
                    </span>
                    <div className="relative">
                      <img
                        src={song.cover_url || "https://via.placeholder.com/50"}
                        alt={song.title}
                        className="w-12 h-12 rounded"
                      />
                      <button
                        onClick={() => handlePlay(song)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        {currentSong?.id === song.id && isPlaying ? (
                          <Pause className="w-5 h-5 text-white fill-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-white" />
                        )}
                      </button>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{song.title}</p>
                      <p className="text-gray-400 text-sm">
                        {song.artist_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <p className="text-gray-400 text-sm">
                      {song.play_count} plays
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Artists */}
        <div className="mt-8 bg-zinc-900/40 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-white text-2xl font-bold">Top Artists</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
            {topArtists.map((artist, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-3">
                  <span className="text-white text-3xl font-bold">
                    {index + 1}
                  </span>
                </div>
                <p className="text-white font-semibold mb-1">
                  {artist.artist_name}
                </p>
                <p className="text-gray-400 text-sm">
                  {artist.play_count} plays
                </p>
                <p className="text-gray-500 text-xs">
                  {artist.unique_songs} songs
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
