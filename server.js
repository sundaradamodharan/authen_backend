// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000","https://frontendauthen.netlify.app/"] , // frontend origin
  credentials: true                // allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); 

// Routes
app.use("/api/auth", authRoutes);       // Login & Register
app.use("/api/users", userRoutes);       // Admin: Manage users
app.use("/api/products", productRoutes); // Admin: Manage products
app.use("/api/orders", orderRoutes);     // Orders CRUD

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
