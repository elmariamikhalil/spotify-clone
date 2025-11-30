import pool from "../config/db.js";

// Export user's complete data (GDPR compliance)
export const exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // User profile
    const userResult = await pool.query(
      "SELECT id, email, username, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    // Playlists
    const playlistsResult = await pool.query(
      "SELECT * FROM playlists WHERE user_id = $1",
      [userId]
    );

    // Liked songs
    const likesResult = await pool.query(
      `
      SELECT s.title, a.artist_name, l.created_at
      FROM likes l
      JOIN songs s ON l.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE l.user_id = $1
    `,
      [userId]
    );

    // Listening history
    const historyResult = await pool.query(
      `
      SELECT s.title, a.artist_name, lh.played_at, lh.duration_played
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE lh.user_id = $1
      ORDER BY lh.played_at DESC
    `,
      [userId]
    );

    // Followed artists
    const followingResult = await pool.query(
      `
      SELECT a.artist_name, f.followed_at
      FROM followers f
      JOIN artists a ON f.artist_id = a.id
      WHERE f.user_id = $1
    `,
      [userId]
    );

    const exportData = {
      user: userResult.rows[0],
      playlists: playlistsResult.rows,
      liked_songs: likesResult.rows,
      listening_history: historyResult.rows,
      following: followingResult.rows,
      export_date: new Date().toISOString(),
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export artist data
export const exportArtistData = async (req, res) => {
  try {
    const artistResult = await pool.query(
      "SELECT id FROM artists WHERE user_id = $1",
      [req.user.id]
    );

    if (artistResult.rows.length === 0) {
      return res.status(403).json({ error: "Not an artist" });
    }

    const artistId = artistResult.rows[0].id;

    // Artist profile
    const profileResult = await pool.query(
      "SELECT * FROM artists WHERE id = $1",
      [artistId]
    );

    // Songs
    const songsResult = await pool.query(
      "SELECT * FROM songs WHERE artist_id = $1",
      [artistId]
    );

    // Albums
    const albumsResult = await pool.query(
      "SELECT * FROM albums WHERE artist_id = $1",
      [artistId]
    );

    // Analytics
    const analyticsResult = await pool.query(
      `
      SELECT s.title, a.date, a.plays_count
      FROM analytics a
      JOIN songs s ON a.song_id = s.id
      WHERE s.artist_id = $1
      ORDER BY a.date DESC
    `,
      [artistId]
    );

    // Followers count
    const followersResult = await pool.query(
      "SELECT COUNT(*) as follower_count FROM followers WHERE artist_id = $1",
      [artistId]
    );

    const exportData = {
      artist: profileResult.rows[0],
      songs: songsResult.rows,
      albums: albumsResult.rows,
      analytics: analyticsResult.rows,
      follower_count: parseInt(followersResult.rows[0].follower_count),
      export_date: new Date().toISOString(),
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export playlist as M3U
export const exportPlaylistM3U = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const playlistResult = await pool.query(
      "SELECT name FROM playlists WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const songsResult = await pool.query(
      `
      SELECT s.title, a.artist_name, s.file_url, s.duration
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE ps.playlist_id = $1
      ORDER BY ps.position
    `,
      [id]
    );

    // Generate M3U format
    let m3u = "#EXTM3U\n";
    m3u += `#PLAYLIST:${playlistResult.rows[0].name}\n\n`;

    songsResult.rows.forEach((song) => {
      m3u += `#EXTINF:${song.duration},${song.artist_name} - ${song.title}\n`;
      m3u += `${song.file_url}\n\n`;
    });

    res.setHeader("Content-Type", "audio/x-mpegurl");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${playlistResult.rows[0].name}.m3u"`
    );
    res.send(m3u);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export listening stats as CSV
export const exportStatsCSV = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        s.title,
        a.artist_name,
        s.genre,
        COUNT(lh.id) as play_count,
        SUM(lh.duration_played) as total_seconds
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      JOIN artists a ON s.artist_id = a.id
      WHERE lh.user_id = $1
      GROUP BY s.id, s.title, a.artist_name, s.genre
      ORDER BY play_count DESC
    `,
      [req.user.id]
    );

    // Generate CSV
    let csv = "Title,Artist,Genre,Play Count,Total Minutes\n";
    result.rows.forEach((row) => {
      const minutes = Math.round(row.total_seconds / 60);
      csv += `"${row.title}","${row.artist_name}","${row.genre || "N/A"}",${
        row.play_count
      },${minutes}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="listening-stats.csv"'
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
