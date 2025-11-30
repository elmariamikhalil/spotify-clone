CREATE DATABASE spotify_clone;

\c spotify_clone;

CREATE TYPE user_role AS ENUM ('user', 'artist', 'admin');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist_name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE albums (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  cover_url VARCHAR(500),
  release_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE songs (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  cover_url VARCHAR(500),
  genre VARCHAR(100),
  plays INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cover_url VARCHAR(500),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlist_songs (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (playlist_id, song_id)
);

CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, song_id)
);

CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  plays_count INTEGER DEFAULT 0,
  date DATE NOT NULL,
  UNIQUE (song_id, date)
);

CREATE INDEX idx_songs_artist ON songs(artist_id);
CREATE INDEX idx_songs_genre ON songs(genre);
CREATE INDEX idx_playlists_user ON playlists(user_id);
CREATE INDEX idx_analytics_date ON analytics(date);

-- Additional indexes for performance optimization

-- Songs indexes
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_songs_plays ON songs(plays DESC);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_song_date ON analytics(song_id, date);

-- Playlists indexes
CREATE INDEX IF NOT EXISTS idx_playlists_created ON playlists(created_at DESC);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_user_created ON likes(user_id, created_at DESC);

-- Albums indexes
CREATE INDEX IF NOT EXISTS idx_albums_release ON albums(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist_id);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Full-text search on songs (for better search performance)
CREATE INDEX IF NOT EXISTS idx_songs_title_trgm ON songs USING gin(title gin_trgm_ops);

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- View for popular songs (materialized for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_songs_view AS
SELECT 
  s.*,
  a.artist_name,
  COALESCE(SUM(an.plays_count), 0) as last_week_plays
FROM songs s
JOIN artists a ON s.artist_id = a.id
LEFT JOIN analytics an ON s.id = an.song_id 
  AND an.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY s.id, a.artist_name
ORDER BY last_week_plays DESC;

-- Refresh materialized view (run daily)
-- REFRESH MATERIALIZED VIEW popular_songs_view;

-- Function to clean up old analytics data (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics 
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Vacuum and analyze for better query planning
VACUUM ANALYZE;