import pool from "../config/db.js";

// Follow an artist
export const followArtist = async (req, res) => {
  try {
    const { artistId } = req.params;

    // Check if artist exists
    const artistCheck = await pool.query(
      "SELECT id FROM artists WHERE id = $1",
      [artistId]
    );
    if (artistCheck.rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }

    await pool.query(
      "INSERT INTO followers (user_id, artist_id) VALUES ($1, $2) ON CONFLICT (user_id, artist_id) DO NOTHING",
      [req.user.id, artistId]
    );

    res.json({ message: "Artist followed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unfollow an artist
export const unfollowArtist = async (req, res) => {
  try {
    const { artistId } = req.params;

    await pool.query(
      "DELETE FROM followers WHERE user_id = $1 AND artist_id = $2",
      [req.user.id, artistId]
    );

    res.json({ message: "Artist unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's followed artists
export const getFollowedArtists = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        a.*,
        f.followed_at,
        COUNT(DISTINCT s.id) as song_count
      FROM followers f
      JOIN artists a ON f.artist_id = a.id
      LEFT JOIN songs s ON a.id = s.artist_id
      WHERE f.user_id = $1
      GROUP BY a.id, f.followed_at
      ORDER BY f.followed_at DESC
    `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check if user follows artist
export const checkFollowing = async (req, res) => {
  try {
    const { artistId } = req.params;

    const result = await pool.query(
      "SELECT id FROM followers WHERE user_id = $1 AND artist_id = $2",
      [req.user.id, artistId]
    );

    res.json({ following: result.rows.length > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get artist's followers count
export const getArtistFollowers = async (req, res) => {
  try {
    const artistResult = await pool.query(
      "SELECT id FROM artists WHERE user_id = $1",
      [req.user.id]
    );

    if (artistResult.rows.length === 0) {
      return res.status(403).json({ error: "Not an artist" });
    }

    const result = await pool.query(
      "SELECT COUNT(*) as follower_count FROM followers WHERE artist_id = $1",
      [artistResult.rows[0].id]
    );

    res.json({
      follower_count: parseInt(result.rows[0].follower_count),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
