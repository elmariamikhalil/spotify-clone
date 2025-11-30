import { useContext, useState, useEffect } from "react";
import { PlayerContext } from "../../contexts/PlayerContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  ListMusic,
  X,
} from "lucide-react";

export default function Player() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    audioRef,
    queue,
    currentIndex,
  } = useContext(PlayerContext);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const handleSeek = (e) => {
    const time = (e.target.value / 100) * duration;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolume = (e) => {
    const vol = e.target.value;
    setVolume(vol);
    audioRef.current.volume = vol / 100;
    setIsMuted(vol == 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume / 100;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentSong) return null;

  const progress = (currentTime / duration) * 100 || 0;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-zinc-900 border-t border-zinc-800 px-4 py-3 backdrop-blur-xl z-50">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* Song Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img
              src={currentSong.cover_url || "https://via.placeholder.com/56"}
              alt={currentSong.title}
              className="w-14 h-14 rounded shadow-lg"
            />
            <div className="min-w-0">
              <p className="text-white font-medium truncate hover:underline cursor-pointer">
                {currentSong.title}
              </p>
              <p className="text-gray-400 text-sm truncate hover:underline cursor-pointer">
                {currentSong.artist_name}
              </p>
            </div>
            <button className="text-gray-400 hover:text-white transition ml-2">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl px-4">
            <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-white transition">
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={playPrevious}
                className="text-gray-400 hover:text-white transition hover:scale-110"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              <button
                onClick={togglePlay}
                className="bg-white p-2 rounded-full hover:scale-105 transition shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black fill-black" />
                ) : (
                  <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                )}
              </button>
              <button
                onClick={playNext}
                className="text-gray-400 hover:text-white transition hover:scale-110"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
              <button className="text-gray-400 hover:text-white transition">
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-gray-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 group">
                <div className="relative h-1 bg-zinc-600 rounded-full cursor-pointer">
                  <div
                    className="absolute h-1 bg-white rounded-full transition-all group-hover:bg-green-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 shadow-lg transition"
                    style={{
                      left: `${progress}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="text-gray-400 hover:text-white transition mr-2"
            >
              <ListMusic className="w-5 h-5" />
            </button>

            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition"
            >
              {isMuted || volume == 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <div className="w-24 group">
              <div className="relative h-1 bg-zinc-600 rounded-full">
                <div
                  className="absolute h-1 bg-white rounded-full group-hover:bg-green-500 transition"
                  style={{ width: `${isMuted ? 0 : volume}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="fixed bottom-24 right-4 w-96 bg-zinc-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-40">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-bold">Queue</h3>
            <button
              onClick={() => setShowQueue(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {queue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className={`p-3 flex items-center gap-3 hover:bg-white/5 ${
                  index === currentIndex ? "bg-white/10" : ""
                }`}
              >
                <span
                  className={`text-sm w-6 ${
                    index === currentIndex ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  {index + 1}
                </span>
                <img
                  src={song.cover_url || "https://via.placeholder.com/40"}
                  alt={song.title}
                  className="w-10 h-10 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      index === currentIndex ? "text-green-500" : "text-white"
                    }`}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {song.artist_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
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
