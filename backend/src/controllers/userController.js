import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    // Update user
    await pool.query(
      "UPDATE users SET username = $1, email = $2 WHERE id = $3",
      [username, email, userId]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password hash
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newPasswordHash,
      userId,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user (cascade will handle related data)
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, email, username, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
