import { useState, useEffect } from 'react';
import { playlists } from '../../services/api';
import { PlusCircle, Music } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Library() {
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    const { data } = await playlists.getAll();
    setUserPlaylists(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await playlists.create({ name: newPlaylistName });
    setNewPlaylistName('');
    setShowCreate(false);
    loadPlaylists();
  };

  return (
    <div className="bg-gradient-to-b from-indigo-900 to-black min-h-screen pb-32">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white text-5xl font-bold mb-2">Your Library</h1>
            <p className="text-gray-400">Your playlists and saved music</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition shadow-xl"
          >
            <PlusCircle className="w-5 h-5" />
            Create Playlist
          </button>
        </div>

        {showCreate && (
          <div className="bg-zinc-900/80 backdrop-blur p-6 rounded-xl mb-8 shadow-2xl border border-zinc-800">
            <h3 className="text-white text-xl font-bold mb-4">Create new playlist</h3>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                type="text"
                placeholder="My Playlist #1"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 p-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-green-500 focus:outline-none"
                autoFocus
                required
              />
              <button 
                type="submit" 
                className="bg-green-500 px-8 py-3 rounded-lg text-black font-bold hover:bg-green-400 transition"
              >
                Create
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreate(false)} 
                className="bg-zinc-700 px-8 py-3 rounded-lg text-white font-bold hover:bg-zinc-600 transition"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {userPlaylists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {userPlaylists.map((playlist) => (
              <Link 
                key={playlist.id} 
                to={`/playlist/${playlist.id}`} 
                className="bg-zinc-900/40 backdrop-blur p-5 rounded-lg hover:bg-zinc-800/60 transition-all duration-300 group"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition">
                  <Music className="w-16 h-16 text-white/80" />
                </div>
                <h3 className="text-white font-bold truncate mb-1">{playlist.name}</h3>
                <p className="text-gray-400 text-sm">Playlist</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Create your first playlist</h2>
            <p className="text-gray-400 mb-6">It's easy, we'll help you</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition"
            >
              Create playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}