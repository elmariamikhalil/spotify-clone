export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Duplicate key error (unique constraint violation)
  if (err.code === "23505") {
    return res.status(409).json({
      error: "Resource already exists",
      details: err.detail,
    });
  }

  // Foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({
      error: "Referenced resource does not exist",
      details: err.detail,
    });
  }

  // Not null violation
  if (err.code === "23502") {
    return res.status(400).json({
      error: "Required field is missing",
      details: err.column,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};
