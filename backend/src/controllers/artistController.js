import pool from "../config/db.js";

export const getArtistProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM artists WHERE user_id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artist profile not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateArtistProfile = async (req, res) => {
  try {
    const { artist_name, bio, avatar_url } = req.body;

    await pool.query(
      "UPDATE artists SET artist_name = $1, bio = $2, avatar_url = $3 WHERE user_id = $4",
      [artist_name, bio, avatar_url, req.user.id]
    );

    res.json({ message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getArtistSongs = async (req, res) => {
  try {
    const artistResult = await pool.query(
      "SELECT id FROM artists WHERE user_id = $1",
      [req.user.id]
    );

    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const result = await pool.query(
      "SELECT * FROM songs WHERE artist_id = $1 ORDER BY created_at DESC",
      [artistResult.rows[0].id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getArtistAnalytics = async (req, res) => {
  try {
    const artistResult = await pool.query(
      "SELECT id FROM artists WHERE user_id = $1",
      [req.user.id]
    );

    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const analyticsResult = await pool.query(
      `
      SELECT a.date, SUM(a.plays_count) as total_plays
      FROM analytics a
      JOIN songs s ON a.song_id = s.id
      WHERE s.artist_id = $1
      GROUP BY a.date
      ORDER BY a.date DESC
      LIMIT 30
    `,
      [artistResult.rows[0].id]
    );

    const statsResult = await pool.query(
      `
      SELECT 
        COUNT(*) as total_songs,
        SUM(plays) as total_plays,
        AVG(plays) as avg_plays
      FROM songs
      WHERE artist_id = $1
    `,
      [artistResult.rows[0].id]
    );

    res.json({ analytics: analyticsResult.rows, stats: statsResult.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
