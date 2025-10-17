// backend/routes/orders.js
import express from "express";
import pool from "../db.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// 📦 Get all orders (Admin only)
router.get("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 👤 Get user’s own orders (User)
router.get("/my-orders", verifyToken, authorizeRoles("user", "admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

// ➕ Create an order (User)
router.post("/", verifyToken, authorizeRoles("user", "admin"), async (req, res) => {
  const { product_name, quantity, total_price } = req.body;
  if (!product_name || !quantity || !total_price) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO orders (user_id, product_name, quantity, total_price, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [req.user.id, product_name, quantity, total_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// 🗑 Delete order (Admin only)
router.delete("/:id", verifyToken, authorizeRoles("admin"), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM orders WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;
