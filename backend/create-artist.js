import bcrypt from "bcryptjs";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function createArtist() {
  try {
    const email = "artist@spotify.com";
    const password = "artist123";
    const username = "demoartist";
    const artistName = "Demo Artist";

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await pool.query(
      "INSERT INTO users (email, password_hash, username, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [email, passwordHash, username, "artist"]
    );

    const userId = userResult.rows[0].id;

    // Create artist profile
    await pool.query(
      "INSERT INTO artists (user_id, artist_name, bio) VALUES ($1, $2, $3)",
      [userId, artistName, "Professional demo artist for testing"]
    );

    console.log("✅ Artist account created successfully!");
    console.log("");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("👤 Username:", username);
    console.log("🎤 Artist Name:", artistName);
    console.log("");
    console.log("You can now login at: http://localhost:5173/login");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createArtist();
