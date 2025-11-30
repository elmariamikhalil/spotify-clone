import pool from "../config/db.js";

export const getUserPlaylists = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM playlists WHERE user_id = $1",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const { name, is_public } = req.body;

    const result = await pool.query(
      "INSERT INTO playlists (user_id, name, is_public) VALUES ($1, $2, $3) RETURNING id",
      [req.user.id, name, is_public || false]
    );

    res
      .status(201)
      .json({ id: result.rows[0].id, message: "Playlist created" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlaylistSongs = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT s.*, a.artist_name, ps.position
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE ps.playlist_id = $1
      ORDER BY ps.position
    `,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addSongToPlaylist = async (req, res) => {
  try {
    const { song_id } = req.body;

    const maxPosResult = await pool.query(
      "SELECT COALESCE(MAX(position), 0) as max_pos FROM playlist_songs WHERE playlist_id = $1",
      [req.params.id]
    );

    await pool.query(
      "INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES ($1, $2, $3)",
      [req.params.id, song_id, maxPosResult.rows[0].max_pos + 1]
    );

    res.json({ message: "Song added to playlist" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2",
      [req.params.playlistId, req.params.songId]
    );

    res.json({ message: "Song removed from playlist" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    await pool.query("DELETE FROM playlists WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user.id,
    ]);
    res.json({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
