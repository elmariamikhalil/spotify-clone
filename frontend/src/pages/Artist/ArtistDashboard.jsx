import { useState, useEffect } from "react";
import { artist } from "../../services/api";
import { Upload, Music, TrendingUp, Play, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

export default function ArtistDashboard() {
  const [stats, setStats] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: analyticsData } = await artist.getAnalytics();
    const { data: songs } = await artist.getSongs();
    setStats(analyticsData.stats);
    setAnalytics(analyticsData.analytics);
    setArtistSongs(songs);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  return (
    <div className="bg-gradient-to-b from-blue-900/40 via-zinc-900 to-black min-h-screen pb-32">
      <div className="px-8 pt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-5xl font-bold mb-2">
            Artist Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your music and track your performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Music className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Songs</p>
            <p className="text-white text-4xl font-bold">
              {stats?.total_songs || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Play className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Plays</p>
            <p className="text-white text-4xl font-bold">
              {formatNumber(stats?.total_plays || 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">Avg Plays/Song</p>
            <p className="text-white text-4xl font-bold">
              {formatNumber(Math.round(stats?.avg_plays || 0))}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-10">
          <Link
            to="/artist/upload"
            className="bg-green-500 text-black px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:scale-105 transition shadow-xl"
          >
            <Upload className="w-5 h-5" />
            Upload New Song
          </Link>
        </div>

        {/* Analytics Chart */}
        {analytics.length > 0 && (
          <div className="bg-zinc-900/40 backdrop-blur rounded-xl p-6 mb-10 border border-white/10">
            <h2 className="text-white text-2xl font-bold mb-6">
              Plays Over Time
            </h2>
            <div className="h-64 flex items-end gap-2">
              {analytics
                .slice(0, 30)
                .reverse()
                .map((day, index) => {
                  const maxPlays = Math.max(
                    ...analytics.map((d) => d.total_plays)
                  );
                  const height = (day.total_plays / maxPlays) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2 group"
                    >
                      <div className="relative flex-1 w-full flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-400 hover:to-green-300 transition cursor-pointer"
                          style={{ height: `${height}%` }}
                          title={`${day.total_plays} plays`}
                        ></div>
                      </div>
                      {index % 5 === 0 && (
                        <span className="text-xs text-gray-500">
                          {new Date(day.date).getDate()}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Your Songs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl font-bold">Your Songs</h2>
          </div>

          {artistSongs.length > 0 ? (
            <div className="bg-zinc-900/40 backdrop-blur rounded-xl overflow-hidden border border-white/10">
              {artistSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition group"
                >
                  <span className="text-gray-400 text-sm w-8">{index + 1}</span>

                  <img
                    src={song.cover_url || "https://via.placeholder.com/48"}
                    alt={song.title}
                    className="w-12 h-12 rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {song.title}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {song.genre || "Unknown"}
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-white font-semibold">
                        {formatNumber(song.plays)}
                      </p>
                      <p className="text-gray-400 text-xs">Plays</p>
                    </div>

                    <button className="opacity-0 group-hover:opacity-100 transition">
                      <MoreVertical className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/40 rounded-xl border border-white/10">
              <Music className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-white text-xl font-bold mb-2">
                No songs yet
              </h3>
              <p className="text-gray-400 mb-6">
                Upload your first song to get started
              </p>
              <Link
                to="/artist/upload"
                className="inline-flex items-center gap-2 bg-green-500 text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition"
              >
                <Upload className="w-5 h-5" />
                Upload Song
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
