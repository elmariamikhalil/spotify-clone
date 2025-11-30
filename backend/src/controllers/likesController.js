import pool from "../config/db.js";

export const getUserLikes = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT s.*, a.artist_name, l.created_at as liked_at
      FROM likes l
      JOIN songs s ON l.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const likeSong = async (req, res) => {
  try {
    await pool.query("INSERT INTO likes (user_id, song_id) VALUES ($1, $2)", [
      req.user.id,
      req.params.songId,
    ]);
    res.json({ message: "Song liked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const unlikeSong = async (req, res) => {
  try {
    await pool.query("DELETE FROM likes WHERE user_id = $1 AND song_id = $2", [
      req.user.id,
      req.params.songId,
    ]);
    res.json({ message: "Song unliked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
