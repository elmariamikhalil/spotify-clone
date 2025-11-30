export const validateRegistration = (req, res, next) => {
  const { email, password, username, role } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ error: "Email, password, and username are required" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Password validation
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  // Username validation
  if (username.length < 3) {
    return res
      .status(400)
      .json({ error: "Username must be at least 3 characters" });
  }

  // Role validation
  const validRoles = ["user", "artist", "admin"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  next();
};

export const validateSong = (req, res, next) => {
  const { title, duration, file_url } = req.body;

  if (!title || !duration || !file_url) {
    return res
      .status(400)
      .json({ error: "Title, duration, and file_url are required" });
  }

  if (duration < 1) {
    return res
      .status(400)
      .json({ error: "Duration must be at least 1 second" });
  }

  // URL validation
  try {
    new URL(file_url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid file URL" });
  }

  next();
};

export const validatePlaylist = (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "Playlist name is required" });
  }

  if (name.length > 100) {
    return res
      .status(400)
      .json({ error: "Playlist name must be less than 100 characters" });
  }

  next();
};
