import express from "express";
import { register, login } from "../controllers/authController.js";
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  incrementPlays,
} from "../controllers/songsController.js";
import {
  getUserPlaylists,
  createPlaylist,
  getPlaylistSongs,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
} from "../controllers/playlistsController.js";
import {
  getArtistProfile,
  updateArtistProfile,
  getArtistSongs,
  getArtistAnalytics,
} from "../controllers/artistController.js";
import {
  getAllUsers,
  deleteUser,
  getAllArtists,
  verifyArtist,
  getPlatformStats,
} from "../controllers/adminController.js";
import {
  getUserLikes,
  likeSong,
  unlikeSong,
} from "../controllers/likesController.js";
import {
  getAllAlbums,
  getAlbumById,
  getArtistAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "../controllers/albumsController.js";
import {
  getRecommendations,
  getTrending,
  getSimilarSongs,
  getNewReleases,
} from "../controllers/recommendationsController.js";
import {
  trackPlay,
  getUserHistory,
  getRecentlyPlayed,
  getTopSongs,
  getTopArtists,
  getListeningStats,
} from "../controllers/historyController.js";
import {
  followArtist,
  unfollowArtist,
  getFollowedArtists,
  checkFollowing,
  getArtistFollowers,
} from "../controllers/followersController.js";
import {
  exportUserData,
  exportArtistData,
  exportPlaylistM3U,
  exportStatsCSV,
} from "../controllers/exportController.js";
import {
  uploadAudio as uploadAudioController,
  uploadImage as uploadImageController,
  deleteFile,
  getUploadSignature,
} from "../controllers/uploadController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  validateRegistration,
  validateSong,
  validatePlaylist,
} from "../middleware/validate.js";
import { authLimiter, uploadLimiter } from "../middleware/rateLimiter.js";
import { uploadAudio, uploadImage } from "../middleware/upload.js";
import { apiDocumentation, generateDocsHTML } from "../utils/apiDocs.js";

const router = express.Router();

// API Documentation
router.get("/docs", (req, res) => {
  res.send(generateDocsHTML());
});

router.get("/docs/json", (req, res) => {
  res.json(apiDocumentation);
});

// Auth (with rate limiting)
router.post("/auth/register", authLimiter, validateRegistration, register);
router.post("/auth/login", authLimiter, login);

// Upload (Cloudinary)
router.post(
  "/upload/audio",
  authenticate,
  authorize("artist", "admin"),
  uploadLimiter,
  uploadAudio,
  uploadAudioController
);
router.post(
  "/upload/image",
  authenticate,
  uploadLimiter,
  uploadImage,
  uploadImageController
);
router.post("/upload/signature", authenticate, getUploadSignature);
router.delete("/upload/delete", authenticate, deleteFile);

// Songs
router.get("/songs", getAllSongs);
router.get("/songs/:id", getSongById);
router.post(
  "/songs",
  authenticate,
  authorize("artist", "admin"),
  uploadLimiter,
  validateSong,
  createSong
);
router.put(
  "/songs/:id",
  authenticate,
  authorize("artist", "admin"),
  updateSong
);
router.delete(
  "/songs/:id",
  authenticate,
  authorize("artist", "admin"),
  deleteSong
);
router.post("/songs/:id/play", incrementPlays);

// Albums
router.get("/albums", getAllAlbums);
router.get("/albums/:id", getAlbumById);
router.post("/albums", authenticate, authorize("artist"), createAlbum);
router.put("/albums/:id", authenticate, authorize("artist"), updateAlbum);
router.delete("/albums/:id", authenticate, authorize("artist"), deleteAlbum);

// Recommendations
router.get("/recommendations", authenticate, getRecommendations);
router.get("/recommendations/trending", getTrending);
router.get("/recommendations/similar/:songId", getSimilarSongs);
router.get("/recommendations/new-releases", getNewReleases);

// Listening History
router.post("/history/:songId", authenticate, trackPlay);
router.get("/history", authenticate, getUserHistory);
router.get("/history/recent", authenticate, getRecentlyPlayed);
router.get("/history/top-songs", authenticate, getTopSongs);
router.get("/history/top-artists", authenticate, getTopArtists);
router.get("/history/stats", authenticate, getListeningStats);

// Followers
router.post("/artists/:artistId/follow", authenticate, followArtist);
router.delete("/artists/:artistId/follow", authenticate, unfollowArtist);
router.get("/artists/:artistId/following", authenticate, checkFollowing);
router.get("/following", authenticate, getFollowedArtists);

// Export
router.get("/export/user-data", authenticate, exportUserData);
router.get(
  "/export/artist-data",
  authenticate,
  authorize("artist"),
  exportArtistData
);
router.get("/export/playlist/:id/m3u", authenticate, exportPlaylistM3U);
router.get("/export/stats-csv", authenticate, exportStatsCSV);

// Playlists
router.get("/playlists", authenticate, getUserPlaylists);
router.post("/playlists", authenticate, validatePlaylist, createPlaylist);
router.get("/playlists/:id/songs", getPlaylistSongs);
router.post("/playlists/:id/songs", authenticate, addSongToPlaylist);
router.delete(
  "/playlists/:playlistId/songs/:songId",
  authenticate,
  removeSongFromPlaylist
);
router.delete("/playlists/:id", authenticate, deletePlaylist);

// Likes
router.get("/likes", authenticate, getUserLikes);
router.post("/likes/:songId", authenticate, likeSong);
router.delete("/likes/:songId", authenticate, unlikeSong);

// Artist
router.get(
  "/artist/profile",
  authenticate,
  authorize("artist"),
  getArtistProfile
);
router.put(
  "/artist/profile",
  authenticate,
  authorize("artist"),
  updateArtistProfile
);
router.get("/artist/songs", authenticate, authorize("artist"), getArtistSongs);
router.get(
  "/artist/albums",
  authenticate,
  authorize("artist"),
  getArtistAlbums
);
router.get(
  "/artist/analytics",
  authenticate,
  authorize("artist"),
  getArtistAnalytics
);
router.get(
  "/artist/followers",
  authenticate,
  authorize("artist"),
  getArtistFollowers
);

// Admin
router.get("/admin/users", authenticate, authorize("admin"), getAllUsers);
router.delete("/admin/users/:id", authenticate, authorize("admin"), deleteUser);
router.get("/admin/artists", authenticate, authorize("admin"), getAllArtists);
router.put(
  "/admin/artists/:id/verify",
  authenticate,
  authorize("admin"),
  verifyArtist
);
router.get("/admin/stats", authenticate, authorize("admin"), getPlatformStats);

export default router;
