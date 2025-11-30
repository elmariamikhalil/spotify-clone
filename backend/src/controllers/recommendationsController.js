import pool from "../config/db.js";

// Get personalized recommendations based on user's listening history
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's most played genres
    const genreResult = await pool.query(
      `
      SELECT s.genre, COUNT(*) as play_count
      FROM songs s
      JOIN analytics a ON s.id = a.song_id
      JOIN playlists p ON p.user_id = $1
      JOIN playlist_songs ps ON p.id = ps.playlist_id AND ps.song_id = s.id
      WHERE s.genre IS NOT NULL
      GROUP BY s.genre
      ORDER BY play_count DESC
      LIMIT 3
    `,
      [userId]
    );

    // If user has no history, get top songs overall
    if (genreResult.rows.length === 0) {
      const topSongs = await pool.query(`
        SELECT s.*, a.artist_name
        FROM songs s
        JOIN artists a ON s.artist_id = a.id
        ORDER BY s.plays DESC
        LIMIT 20
      `);

      return res.json(topSongs.rows);
    }

    // Get songs from favorite genres that user hasn't added to playlists
    const favoriteGenres = genreResult.rows.map((r) => r.genre);

    const recommendations = await pool.query(
      `
      SELECT DISTINCT s.*, a.artist_name
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.genre = ANY($1)
      AND s.id NOT IN (
        SELECT ps.song_id 
        FROM playlist_songs ps
        JOIN playlists p ON ps.playlist_id = p.id
        WHERE p.user_id = $2
      )
      ORDER BY s.plays DESC
      LIMIT 20
    `,
      [favoriteGenres, userId]
    );

    res.json(recommendations.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trending songs (most played in last 7 days)
export const getTrending = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await pool.query(
      `
      SELECT s.*, a.artist_name, 
        COALESCE(SUM(an.plays_count), 0) as recent_plays
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      LEFT JOIN analytics an ON s.id = an.song_id AND an.date >= $1
      GROUP BY s.id, a.artist_name
      ORDER BY recent_plays DESC
      LIMIT $2
    `,
      [sevenDaysAgo.toISOString().split("T")[0], parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get similar songs based on genre and artist
export const getSimilarSongs = async (req, res) => {
  try {
    const { songId } = req.params;
    const { limit = 10 } = req.query;

    // Get the song's genre and artist
    const songResult = await pool.query(
      "SELECT genre, artist_id FROM songs WHERE id = $1",
      [songId]
    );

    if (songResult.rows.length === 0) {
      return res.status(404).json({ error: "Song not found" });
    }

    const { genre, artist_id } = songResult.rows[0];

    // Find similar songs (same genre or same artist)
    const result = await pool.query(
      `
      SELECT s.*, a.artist_name,
        CASE 
          WHEN s.artist_id = $2 THEN 2
          WHEN s.genre = $3 THEN 1
          ELSE 0
        END as similarity_score
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.id != $1
      AND (s.genre = $3 OR s.artist_id = $2)
      ORDER BY similarity_score DESC, s.plays DESC
      LIMIT $4
    `,
      [songId, artist_id, genre, parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get new releases (songs added in last 30 days)
export const getNewReleases = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await pool.query(
      `
      SELECT s.*, a.artist_name
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.created_at >= $1
      ORDER BY s.created_at DESC
      LIMIT $2
    `,
      [thirtyDaysAgo, parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
