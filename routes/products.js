import express from 'express';
import pool from '../db.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';


const router = express.Router();


// Get all products (both admin and user)
router.get('/', verifyToken, async (req, res) => {
try {
const result = await pool.query('SELECT * FROM products ORDER BY id');
res.json({ products: result.rows });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Error fetching products' });
}
});


// Create product (admin)
router.post('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
const { name, description, price } = req.body;
try {
const result = await pool.query('INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *', [name, description, price]);
res.json({ product: result.rows[0] });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Error creating product' });
}
});


// Update product (admin)
router.put('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
const { id } = req.params;
const { name, description, price } = req.body;
try {
const result = await pool.query('UPDATE products SET name=$1, description=$2, price=$3 WHERE id=$4 RETURNING *', [name, description, price, id]);
res.json({ product: result.rows[0] });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Error updating product' });
}
});


// Delete product (admin)
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
const { id } = req.params;
try {
await pool.query('DELETE FROM products WHERE id=$1', [id]);
res.json({ message: 'Deleted' });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Error deleting product' });
}
});


export default router;