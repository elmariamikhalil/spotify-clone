import { useContext } from "react";
import { PlayerContext } from "../../contexts/PlayerContext";
import { Play, Pause } from "lucide-react";
import LikeButton from "./LikeButton";

export default function SongCard({ song }) {
  const { playSong, currentSong, isPlaying, togglePlay } =
    useContext(PlayerContext);

  const handlePlayClick = () => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, [song]);
    }
  };

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrentSong && isPlaying;

  return (
    <div className="bg-zinc-800/40 hover:bg-zinc-700/40 p-4 rounded-lg transition group cursor-pointer relative">
      <div className="relative mb-4">
        <img
          src={song.cover_url || "https://via.placeholder.com/200"}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-md"
        />
        <button
          onClick={handlePlayClick}
          className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition"
        >
          {isCurrentPlaying ? (
            <Pause className="w-6 h-6 text-black fill-black" />
          ) : (
            <Play className="w-6 h-6 text-black fill-black ml-0.5" />
          )}
        </button>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate mb-1">
            {song.title}
          </h3>
          <p className="text-gray-400 text-sm truncate">{song.artist_name}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition">
          <LikeButton songId={song.id} size="sm" />
        </div>
      </div>
    </div>
  );
}
