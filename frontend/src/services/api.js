// frontend/src/services/api.js
import axios from "axios";

// frontend/src/services/api.js
const API_URL = "https://api.kael.es/api";
//const API_URL = "/api";
// Or if you have a domain: 'https://yourdomain.com/api'

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

export const songs = {
  getAll: () => api.get("/songs"),
  getById: (id) => api.get(`/songs/${id}`),
  create: (data) => api.post("/songs", data),
  update: (id, data) => api.put(`/songs/${id}`, data),
  delete: (id) => api.delete(`/songs/${id}`),
  play: (id) => api.post(`/songs/${id}/play`),
};

export const playlists = {
  getAll: () => api.get("/playlists"),
  create: (data) => api.post("/playlists", data),
  getSongs: (id) => api.get(`/playlists/${id}/songs`),
  addSong: (playlistId, songId) =>
    api.post(`/playlists/${playlistId}/songs`, { song_id: songId }),
  removeSong: (playlistId, songId) =>
    api.delete(`/playlists/${playlistId}/songs/${songId}`),
  delete: (id) => api.delete(`/playlists/${id}`),
};

export const likes = {
  getAll: () => api.get("/likes"),
  like: (songId) => api.post(`/likes/${songId}`),
  unlike: (songId) => api.delete(`/likes/${songId}`),
};

export const artist = {
  getProfile: () => api.get("/artist/profile"),
  updateProfile: (data) => api.put("/artist/profile", data),
  getSongs: () => api.get("/artist/songs"),
  getAnalytics: () => api.get("/artist/analytics"),
};

export const admin = {
  getUsers: () => api.get("/admin/users"),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getArtists: () => api.get("/admin/artists"),
  verifyArtist: (id, verified) =>
    api.put(`/admin/artists/${id}/verify`, { verified }),
  getStats: () => api.get("/admin/stats"),
};

export default api;
