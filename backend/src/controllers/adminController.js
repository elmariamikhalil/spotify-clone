import pool from "../config/db.js";

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, username, role, created_at FROM users"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllArtists = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.email, u.username 
      FROM artists a
      JOIN users u ON a.user_id = u.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyArtist = async (req, res) => {
  try {
    await pool.query("UPDATE artists SET verified = $1 WHERE id = $2", [
      req.body.verified,
      req.params.id,
    ]);
    res.json({ message: "Artist verification updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const userCount = await pool.query("SELECT COUNT(*) as count FROM users");
    const artistCount = await pool.query(
      "SELECT COUNT(*) as count FROM artists"
    );
    const songCount = await pool.query("SELECT COUNT(*) as count FROM songs");
    const totalPlays = await pool.query(
      "SELECT SUM(plays) as total FROM songs"
    );

    res.json({
      users: userCount.rows[0].count,
      artists: artistCount.rows[0].count,
      songs: songCount.rows[0].count,
      totalPlays: totalPlays.rows[0].total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
