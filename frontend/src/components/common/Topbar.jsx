import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Search, Bell, ChevronLeft, ChevronRight, Settings, LogOut, BarChart } from 'lucide-react';

export default function TopBar() {
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const showSearch = location.pathname === '/' || location.pathname === '/search';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitial = () => {
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="h-16 bg-zinc-900/95 backdrop-blur flex items-center justify-between px-6 border-b border-white/5 sticky top-0 z-30">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => window.history.forward()}
          className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to listen to?"
                className="w-80 pl-10 pr-4 py-2 bg-white text-black rounded-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </form>
        )}
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 flex items-center justify-center hover:scale-110 transition">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white transition" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 bg-black/40 hover:bg-black/60 transition rounded-full pl-1 pr-4 py-1"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{getUserInitial()}</span>
            </div>
            <span className="text-white font-semibold text-sm">{user?.username}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-800 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
              <div className="p-3 border-b border-white/10">
                <p className="text-white font-semibold">{user?.username}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                  {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                </span>
              </div>

              <div className="py-2">
                {user?.role === 'artist' && (
                  <button
                    onClick={() => {
                      navigate('/artist');
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition text-left"
                  >
                    <BarChart className="w-5 h-5 text-gray-400" />
                    <span className="text-white">Artist Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition text-left"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Settings</span>
                </button>

                <div className="border-t border-white/10 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition text-left"
                >
                  <LogOut className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}