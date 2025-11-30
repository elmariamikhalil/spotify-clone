import { useState, useEffect, useContext } from "react";
import { songs } from "../../services/api";
import { PlayerContext } from "../../contexts/PlayerContext";
import { Play, Pause } from "lucide-react";

export default function Home() {
  const [allSongs, setAllSongs] = useState([]);
  const { playSong, currentSong, isPlaying, togglePlay } =
    useContext(PlayerContext);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    const { data } = await songs.getAll();
    setAllSongs(data.songs || data);
  };

  const handlePlayClick = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, allSongs);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="bg-gradient-to-b from-zinc-800 via-zinc-900 to-black min-h-screen">
      <div className="px-8 pt-6 pb-32">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-2">
            {getGreeting()}
          </h1>
        </div>

        {/* Featured Hero Card */}
        {allSongs.length > 0 && (
          <div className="mb-12">
            <div className="relative bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-orange-900/40 rounded-2xl p-8 overflow-hidden backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="max-w-lg">
                  <p className="text-purple-300 text-sm font-semibold mb-2 tracking-wide uppercase">
                    Trending
                  </p>
                  <h2 className="text-white text-5xl font-bold mb-3">
                    {allSongs[0].title}
                  </h2>
                  <p className="text-gray-300 text-lg mb-6">
                    {allSongs[0].artist_name} • {allSongs[0].plays} plays
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handlePlayClick(allSongs[0])}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition shadow-2xl"
                    >
                      {currentSong?.id === allSongs[0].id && isPlaying ? (
                        <>
                          <Pause className="w-5 h-5" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-white" /> Play Now
                        </>
                      )}
                    </button>
                    <button className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white/60 hover:scale-105 transition">
                      <Heart className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <img
                    src={
                      allSongs[0].cover_url || "https://via.placeholder.com/300"
                    }
                    alt={allSongs[0].title}
                    className="w-80 h-80 object-cover rounded-xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Picks - Large Cards */}
        <div className="mb-10">
          <h2 className="text-white text-2xl font-bold mb-6">Quick picks</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allSongs.slice(0, 6).map((song) => (
              <div
                key={song.id}
                className="bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-4 overflow-hidden group cursor-pointer transition"
                onClick={() => handlePlayClick(song)}
              >
                <img
                  src={song.cover_url || "https://via.placeholder.com/80"}
                  alt={song.title}
                  className="w-20 h-20 object-cover"
                />
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-white font-semibold truncate">
                    {song.title}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {song.artist_name}
                  </p>
                </div>
                <button className="mr-4 opacity-0 group-hover:opacity-100 transition">
                  {currentSong?.id === song.id && isPlaying ? (
                    <Pause className="w-10 h-10 text-white fill-white" />
                  ) : (
                    <Play className="w-10 h-10 text-white fill-white" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Songs You Might Like */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl font-bold">
              Songs you might like
            </h2>
            <button className="text-gray-400 hover:text-white text-sm font-semibold">
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {allSongs.map((song) => (
              <div
                key={song.id}
                className="bg-zinc-900/40 backdrop-blur p-4 rounded-lg hover:bg-zinc-800/60 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative mb-4">
                  <img
                    src={song.cover_url || "https://via.placeholder.com/200"}
                    alt={song.title}
                    className="w-full aspect-square object-cover rounded-md shadow-2xl"
                  />
                  <button
                    onClick={() => handlePlayClick(song)}
                    className="absolute bottom-2 right-2 bg-green-500 p-3 rounded-full shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 hover:bg-green-400"
                  >
                    {currentSong?.id === song.id && isPlaying ? (
                      <Pause className="w-5 h-5 text-black fill-black" />
                    ) : (
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    )}
                  </button>
                </div>
                <h3 className="text-white font-bold truncate mb-1">
                  {song.title}
                </h3>
                <p className="text-gray-400 text-sm truncate">
                  {song.artist_name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Artists */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl font-bold">Top artists</h2>
            <button className="text-gray-400 hover:text-white text-sm font-semibold">
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {allSongs.slice(0, 6).map((song) => (
              <div
                key={`artist-${song.id}`}
                className="bg-zinc-900/40 backdrop-blur p-4 rounded-lg hover:bg-zinc-800/60 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative mb-4">
                  <img
                    src={song.cover_url || "https://via.placeholder.com/200"}
                    alt={song.artist_name}
                    className="w-full aspect-square object-cover rounded-full shadow-2xl"
                  />
                  <button
                    onClick={() => handlePlayClick(song)}
                    className="absolute bottom-2 right-2 bg-green-500 p-3 rounded-full shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 hover:bg-green-400"
                  >
                    <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                  </button>
                </div>
                <h3 className="text-white font-bold truncate mb-1">
                  {song.artist_name}
                </h3>
                <p className="text-gray-400 text-sm truncate">Artist</p>
              </div>
            ))}
          </div>
        </div>

        {allSongs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No songs available yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Check back later for new music
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Heart({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}
