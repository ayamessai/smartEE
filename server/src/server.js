// server.js
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import basketRoutes from "./routes/basket.js";
import repairmenRoutes from "./routes/repairmen.js";
import notificationsRoutes from "./routes/notifications.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();
const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      "https://smartee-frontend.onrender.com", // frontend live
      "http://localhost:5173",                 // local dev
      "http://localhost:5174"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// API Routes
console.log("✅ Loading routes...");
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/basket", basketRoutes);
app.use("/api/repairmen", repairmenRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/orders", orderRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ------------------------------------------------------------
// Start server
// ------------------------------------------------------------
const PORT = process.env.PORT || 4000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/eco_electro";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  });
