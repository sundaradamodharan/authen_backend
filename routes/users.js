// backend/routes/users.js
import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

/* 🧑‍💼 Get all users (Admin only) */
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/* 🔄 Update user role (Admin only) */
router.put("/:id/role", verifyToken, authorizeRoles("admin"), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ error: "Invalid role. Use 'admin' or 'user'." });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role",
      [role, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: `User role updated to '${role}'`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

/* 🗑 Delete user (Admin only) */
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/* 👤 Get current logged-in user profile */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
