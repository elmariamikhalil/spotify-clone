import pool from "../config/db.js";

export const getAllSongs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sort = "created_at",
      order = "DESC",
      genre,
      search,
    } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, a.artist_name, al.title as album_title
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by genre
    if (genre) {
      query += ` AND s.genre = $${paramCount}`;
      params.push(genre);
      paramCount++;
    }

    // Search by title or artist
    if (search) {
      query += ` AND (s.title ILIKE $${paramCount} OR a.artist_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Validate sort column
    const validSortColumns = ["created_at", "title", "plays", "artist_name"];
    const sortColumn = validSortColumns.includes(sort) ? sort : "created_at";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    query += ` ORDER BY s.${sortColumn} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery =
      "SELECT COUNT(*) FROM songs s JOIN artists a ON s.artist_id = a.id WHERE 1=1";
    const countParams = [];
    let countParamCount = 1;

    if (genre) {
      countQuery += ` AND s.genre = $${countParamCount}`;
      countParams.push(genre);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND (s.title ILIKE $${countParamCount} OR a.artist_name ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      songs: result.rows,
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

export const getSongById = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT s.*, a.artist_name, al.title as album_title
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      WHERE s.id = $1
    `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Song not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createSong = async (req, res) => {
  try {
    const { title, duration, file_url, cover_url, genre, album_id } = req.body;

    const artistResult = await pool.query(
      "SELECT id FROM artists WHERE user_id = $1",
      [req.user.id]
    );

    if (artistResult.rows.length === 0) {
      return res.status(403).json({ error: "Not an artist" });
    }

    const result = await pool.query(
      "INSERT INTO songs (artist_id, album_id, title, duration, file_url, cover_url, genre) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        artistResult.rows[0].id,
        album_id || null,
        title,
        duration,
        file_url,
        cover_url,
        genre,
      ]
    );

    res.status(201).json({
      id: result.rows[0].id,
      message: "Song created successfully",
      song: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSong = async (req, res) => {
  try {
    const { title, genre, cover_url, album_id } = req.body;

    // Verify ownership
    const ownerCheck = await pool.query(
      `
      SELECT s.id FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.id = $1 AND a.user_id = $2
    `,
      [req.params.id, req.user.id]
    );

    if (ownerCheck.rows.length === 0 && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to update this song" });
    }

    await pool.query(
      "UPDATE songs SET title = $1, genre = $2, cover_url = $3, album_id = $4 WHERE id = $5",
      [title, genre, cover_url, album_id || null, req.params.id]
    );

    res.json({ message: "Song updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSong = async (req, res) => {
  try {
    // Verify ownership
    const ownerCheck = await pool.query(
      `
      SELECT s.id FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.id = $1 AND a.user_id = $2
    `,
      [req.params.id, req.user.id]
    );

    if (ownerCheck.rows.length === 0 && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this song" });
    }

    await pool.query("DELETE FROM songs WHERE id = $1", [req.params.id]);
    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const incrementPlays = async (req, res) => {
  try {
    await pool.query("UPDATE songs SET plays = plays + 1 WHERE id = $1", [
      req.params.id,
    ]);

    const today = new Date().toISOString().split("T")[0];
    await pool.query(
      `INSERT INTO analytics (song_id, plays_count, date) 
       VALUES ($1, 1, $2) 
       ON CONFLICT (song_id, date) 
       DO UPDATE SET plays_count = analytics.plays_count + 1`,
      [req.params.id, today]
    );

    res.json({ message: "Play counted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
