import pool from "../config/db.js";

export const getArtistAlbums = async (req, res) => {
  try {
    const artistResult = await pool.query(
      "SELECT id FROM artists WHERE user_id = $1",
      [req.user.id]
    );

    if (artistResult.rows.length === 0) {
      return res.status(403).json({ error: "Not an artist" });
    }

    const result = await pool.query(
      `
      SELECT a.*, 
        COUNT(DISTINCT s.id) as song_count,
        COALESCE(SUM(s.plays), 0) as total_plays
      FROM albums a
      LEFT JOIN songs s ON a.id = s.album_id
      WHERE a.artist_id = $1
      GROUP BY a.id
      ORDER BY a.release_date DESC
    `,
      [artistResult.rows[0].id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAlbum = async (req, res) => {
  try {
    const { title, cover_url, release_date } = req.body;

    const artistResult = await pool.query(
      "SELECT id FROM artists WHERE user_id = $1",
      [req.user.id]
    );

    if (artistResult.rows.length === 0) {
      return res.status(403).json({ error: "Not an artist" });
    }

    const result = await pool.query(
      "INSERT INTO albums (artist_id, title, cover_url, release_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [artistResult.rows[0].id, title, cover_url, release_date || new Date()]
    );

    res.status(201).json({
      message: "Album created successfully",
      album: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { title, cover_url, release_date } = req.body;

    // Verify ownership
    const ownerCheck = await pool.query(
      `
      SELECT al.id FROM albums al
      JOIN artists a ON al.artist_id = a.id
      WHERE al.id = $1 AND a.user_id = $2
    `,
      [req.params.id, req.user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this album" });
    }

    await pool.query(
      "UPDATE albums SET title = $1, cover_url = $2, release_date = $3 WHERE id = $4",
      [title, cover_url, release_date, req.params.id]
    );

    res.json({ message: "Album updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    // Verify ownership
    const ownerCheck = await pool.query(
      `
      SELECT al.id FROM albums al
      JOIN artists a ON al.artist_id = a.id
      WHERE al.id = $1 AND a.user_id = $2
    `,
      [req.params.id, req.user.id]
    );

    if (ownerCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this album" });
    }

    // Set songs to null album_id before deleting album
    await pool.query("UPDATE songs SET album_id = NULL WHERE album_id = $1", [
      req.params.id,
    ]);
    await pool.query("DELETE FROM albums WHERE id = $1", [req.params.id]);

    res.json({ message: "Album deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAlbumById = async (req, res) => {
  try {
    const albumResult = await pool.query(
      `
      SELECT a.*, ar.artist_name
      FROM albums a
      JOIN artists ar ON a.artist_id = ar.id
      WHERE a.id = $1
    `,
      [req.params.id]
    );

    if (albumResult.rows.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }

    const songsResult = await pool.query(
      `
      SELECT s.*, ar.artist_name
      FROM songs s
      JOIN artists ar ON s.artist_id = ar.id
      WHERE s.album_id = $1
      ORDER BY s.created_at
    `,
      [req.params.id]
    );

    res.json({
      album: albumResult.rows[0],
      songs: songsResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAlbums = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "release_date",
      order = "DESC",
    } = req.query;
    const offset = (page - 1) * limit;

    const validSortColumns = ["release_date", "title"];
    const sortColumn = validSortColumns.includes(sort) ? sort : "release_date";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const result = await pool.query(
      `
      SELECT a.*, ar.artist_name,
        COUNT(DISTINCT s.id) as song_count,
        COALESCE(SUM(s.plays), 0) as total_plays
      FROM albums a
      JOIN artists ar ON a.artist_id = ar.id
      LEFT JOIN songs s ON a.id = s.album_id
      GROUP BY a.id, ar.artist_name
      ORDER BY a.${sortColumn} ${sortOrder}
      LIMIT $1 OFFSET $2
    `,
      [parseInt(limit), offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM albums");
    const total = parseInt(countResult.rows[0].count);

    res.json({
      albums: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
