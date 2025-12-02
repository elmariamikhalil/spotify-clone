import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/User/Home";
import Search from "./pages/User/Search";
import Library from "./pages/User/Library";
import LikedSongs from "./pages/User/LikedSongs";
import PlaylistDetail from "./pages/User/PlaylistDetail";
import History from "./pages/User/History";
import Settings from "./pages/User/Settings";
import ArtistDashboard from "./pages/Artist/ArtistDashboard";
import UploadSong from "./pages/Artist/Uploadsong";
import Albums from "./pages/Artist/Albums";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Sidebar from "./components/common/Sidebar";
import TopBar from "./components/common/TopBar";
import Player from "./components/player/Player";
import Loading from "./components/common/Loading";

function PrivateRoute({ children, roles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
}

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-zinc-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-auto pb-24">{children}</div>
      </div>
      <Player />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <Layout>
                    <Search />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/library"
              element={
                <PrivateRoute>
                  <Layout>
                    <Library />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/liked"
              element={
                <PrivateRoute>
                  <Layout>
                    <LikedSongs />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/playlist/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <PlaylistDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <Layout>
                    <History />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/artist"
              element={
                <PrivateRoute roles={["artist"]}>
                  <Layout>
                    <ArtistDashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/artist/upload"
              element={
                <PrivateRoute roles={["artist"]}>
                  <Layout>
                    <UploadSong />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/artist/albums"
              element={
                <PrivateRoute roles={["artist"]}>
                  <Layout>
                    <Albums />
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <PrivateRoute roles={["admin"]}>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
