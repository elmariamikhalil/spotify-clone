import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import {
  Home,
  Search,
  Library,
  PlusSquare,
  Heart,
  LogOut,
  BarChart,
  Settings,
  Menu,
  X,
  Clock,
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-40"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        bg-black h-screen flex flex-col p-2 transition-transform duration-300 z-50
        fixed lg:relative w-72
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={closeMobile}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="px-6 py-6">
          <h1 className="text-white text-2xl font-bold">
            <span className="text-green-500">Spot</span>ify
          </h1>
        </div>

        {/* Main Navigation Card */}
        <div className="bg-zinc-900 rounded-xl mb-2 p-4 flex-shrink-0">
          <div className="mb-2 px-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Menu
            </p>
          </div>

          <Link
            to="/"
            onClick={closeMobile}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition mb-2 ${
              isActive("/")
                ? "bg-zinc-800 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="font-semibold">Home</span>
          </Link>

          <Link
            to="/search"
            onClick={closeMobile}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition mb-2 ${
              isActive("/search")
                ? "bg-zinc-800 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="font-semibold">Search</span>
          </Link>

          <Link
            to="/liked"
            onClick={closeMobile}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition mb-2 ${
              isActive("/liked")
                ? "bg-zinc-800 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Heart
              className={`w-6 h-6 ${
                isActive("/liked") ? "fill-green-500 text-green-500" : ""
              }`}
            />
            <span className="font-semibold">Favourites</span>
          </Link>

          <Link
            to="/history"
            onClick={closeMobile}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
              isActive("/history")
                ? "bg-zinc-800 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock className="w-6 h-6" />
            <span className="font-semibold">History</span>
          </Link>
        </div>

        {/* Library Card */}
        <div className="bg-zinc-900 rounded-xl flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-2 px-2">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Playlist
              </p>
            </div>

            <Link
              to="/library"
              onClick={closeMobile}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                isActive("/library")
                  ? "bg-zinc-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <PlusSquare className="w-6 h-6" />
              <span className="font-semibold">Create New</span>
            </Link>
          </div>

          {/* Playlists Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <Link
              to="/library"
              onClick={closeMobile}
              className="block px-4 py-3 rounded-lg hover:bg-zinc-800 transition"
            >
              <p className="text-white font-semibold text-sm">Liked Songs</p>
              <p className="text-gray-400 text-xs">
                Playlist • {user?.username}
              </p>
            </Link>
          </div>

          {/* Artist/Admin Links */}
          {(user?.role === "artist" || user?.role === "admin") && (
            <div className="border-t border-zinc-800 p-4">
              <div className="mb-2 px-2">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  General
                </p>
              </div>

              {user?.role === "artist" && (
                <Link
                  to="/artist"
                  onClick={closeMobile}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition mb-2 ${
                    isActive("/artist")
                      ? "bg-zinc-800 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <BarChart className="w-5 h-5" />
                  <span className="font-semibold text-sm">
                    Artist Dashboard
                  </span>
                </Link>
              )}

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={closeMobile}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                    isActive("/admin")
                      ? "bg-zinc-800 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-semibold text-sm">Admin Panel</span>
                </Link>
              )}
            </div>
          )}

          {/* Bottom User Section */}
          <div className="border-t border-zinc-800 p-4">
            <button
              onClick={() => {
                handleLogout();
                closeMobile();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold text-sm">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
