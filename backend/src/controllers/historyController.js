import pool from "../config/db.js";

// Track song play
export const trackPlay = async (req, res) => {
  try {
    const { songId } = req.params;
    const { duration_played, completed } = req.body;

    await pool.query(
      "INSERT INTO listening_history (user_id, song_id, duration_played, completed) VALUES ($1, $2, $3, $4)",
      [req.user.id, songId, duration_played || 0, completed || false]
    );

    res.json({ message: "Play tracked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's listening history
export const getUserHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT 
        lh.*,
        s.title, s.cover_url, s.duration,
        a.artist_name
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE lh.user_id = $1
      ORDER BY lh.played_at DESC
      LIMIT $2 OFFSET $3
    `,
      [req.user.id, parseInt(limit), offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM listening_history WHERE user_id = $1",
      [req.user.id]
    );

    res.json({
      history: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recently played songs (unique)
export const getRecentlyPlayed = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const result = await pool.query(
      `
      SELECT DISTINCT ON (s.id)
        s.*,
        a.artist_name,
        lh.played_at
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE lh.user_id = $1
      ORDER BY s.id, lh.played_at DESC
      LIMIT $2
    `,
      [req.user.id, parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's top songs (most played)
export const getTopSongs = async (req, res) => {
  try {
    const { period = "30", limit = 20 } = req.query; // period in days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const result = await pool.query(
      `
      SELECT 
        s.*,
        a.artist_name,
        COUNT(lh.id) as play_count
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE lh.user_id = $1 AND lh.played_at >= $2
      GROUP BY s.id, a.artist_name
      ORDER BY play_count DESC
      LIMIT $3
    `,
      [req.user.id, daysAgo, parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's top artists
export const getTopArtists = async (req, res) => {
  try {
    const { period = "30", limit = 10 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const result = await pool.query(
      `
      SELECT 
        a.*,
        COUNT(lh.id) as play_count,
        COUNT(DISTINCT lh.song_id) as unique_songs
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE lh.user_id = $1 AND lh.played_at >= $2
      GROUP BY a.id
      ORDER BY play_count DESC
      LIMIT $3
    `,
      [req.user.id, daysAgo, parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's listening stats
export const getListeningStats = async (req, res) => {
  try {
    const { period = "30" } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Total plays
    const playsResult = await pool.query(
      "SELECT COUNT(*) as total_plays FROM listening_history WHERE user_id = $1 AND played_at >= $2",
      [req.user.id, daysAgo]
    );

    // Total listening time (minutes)
    const timeResult = await pool.query(
      "SELECT COALESCE(SUM(duration_played), 0) / 60 as total_minutes FROM listening_history WHERE user_id = $1 AND played_at >= $2",
      [req.user.id, daysAgo]
    );

    // Unique songs
    const songsResult = await pool.query(
      "SELECT COUNT(DISTINCT song_id) as unique_songs FROM listening_history WHERE user_id = $1 AND played_at >= $2",
      [req.user.id, daysAgo]
    );

    // Unique artists
    const artistsResult = await pool.query(
      `
      SELECT COUNT(DISTINCT s.artist_id) as unique_artists
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      WHERE lh.user_id = $1 AND lh.played_at >= $2
    `,
      [req.user.id, daysAgo]
    );

    // Top genre
    const genreResult = await pool.query(
      `
      SELECT s.genre, COUNT(*) as count
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      WHERE lh.user_id = $1 AND lh.played_at >= $2 AND s.genre IS NOT NULL
      GROUP BY s.genre
      ORDER BY count DESC
      LIMIT 1
    `,
      [req.user.id, daysAgo]
    );

    res.json({
      total_plays: parseInt(playsResult.rows[0].total_plays),
      total_minutes: Math.round(parseFloat(timeResult.rows[0].total_minutes)),
      unique_songs: parseInt(songsResult.rows[0].unique_songs),
      unique_artists: parseInt(artistsResult.rows[0].unique_artists),
      top_genre: genreResult.rows[0]?.genre || null,
      period_days: parseInt(period),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
