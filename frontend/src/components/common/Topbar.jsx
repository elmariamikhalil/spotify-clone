import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, Bell } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");

  const canGoBack = window.history.length > 1;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-gradient-to-b from-zinc-900/95 to-transparent backdrop-blur-md px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            disabled={!canGoBack}
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Search */}
        {(location.pathname === "/" || location.pathname === "/search") && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to listen to?"
                className="w-full bg-zinc-800 text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-gray-400"
              />
            </form>
          </div>
        )}

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition relative">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:scale-105 transition">
            <span className="text-white text-sm font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
