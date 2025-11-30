import { useState, useEffect, useContext } from "react";
import { songs } from "../../services/api";
import { PlayerContext } from "../../contexts/PlayerContext";
import { Play, Pause, Search as SearchIcon, X } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [allSongs, setAllSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const { playSong, currentSong, isPlaying, togglePlay } =
    useContext(PlayerContext);

  useEffect(() => {
    loadSongs();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const filtered = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artist_name.toLowerCase().includes(query.toLowerCase()) ||
          song.genre?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs([]);
    }
  }, [query, allSongs]);

  const loadSongs = async () => {
    const { data } = await songs.getAll();
    setAllSongs(data.songs || data);
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearSearch = () => {
    setQuery("");
    setFilteredSongs([]);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handlePlayClick = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, filteredSongs.length > 0 ? filteredSongs : allSongs);
      saveSearch(query);
    }
  };

  const popularGenres = [
    "Pop",
    "Rock",
    "Hip Hop",
    "R&B",
    "Electronic",
    "Jazz",
    "Classical",
    "Country",
  ];

  return (
    <div className="bg-gradient-to-b from-zinc-800 to-black min-h-screen pb-32">
      <div className="px-8 pt-6">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-white text-5xl font-bold mb-6">Search</h1>

          {/* Search Input */}
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full pl-14 pr-12 py-4 bg-white text-black rounded-full focus:outline-none placeholder:text-gray-600 font-medium"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {query && filteredSongs.length > 0 ? (
          <div>
            <h2 className="text-white text-2xl font-bold mb-6">Songs</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredSongs.map((song) => (
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
        ) : query && filteredSongs.length === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-white text-2xl font-bold mb-2">
              No results found for "{query}"
            </h2>
            <p className="text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-2xl font-bold">
                    Recent searches
                  </h2>
                  <button
                    onClick={clearRecentSearches}
                    className="text-gray-400 hover:text-white text-sm font-semibold"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full transition"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Browse Categories */}
            <div>
              <h2 className="text-white text-2xl font-bold mb-6">
                Browse by genre
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {popularGenres.map((genre, index) => {
                  const colors = [
                    "from-pink-500 to-rose-500",
                    "from-blue-500 to-cyan-500",
                    "from-green-500 to-emerald-500",
                    "from-purple-500 to-violet-500",
                    "from-orange-500 to-amber-500",
                    "from-red-500 to-pink-500",
                    "from-indigo-500 to-blue-500",
                    "from-yellow-500 to-orange-500",
                  ];
                  return (
                    <button
                      key={genre}
                      onClick={() => setQuery(genre)}
                      className={`bg-gradient-to-br ${colors[index]} p-6 rounded-lg hover:scale-105 transition aspect-square flex items-end`}
                    >
                      <h3 className="text-white text-2xl font-bold">{genre}</h3>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Top Results */}
            {allSongs.length > 0 && (
              <div className="mt-10">
                <h2 className="text-white text-2xl font-bold mb-6">
                  Popular right now
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {allSongs.slice(0, 10).map((song) => (
                    <div
                      key={song.id}
                      className="bg-zinc-900/40 backdrop-blur p-4 rounded-lg hover:bg-zinc-800/60 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="relative mb-4">
                        <img
                          src={
                            song.cover_url || "https://via.placeholder.com/200"
                          }
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
