// server.js
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

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
    origin: process.env.CLIENT_URLS?.split(",") || [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());

// 🔽 Mets les logs ici pour savoir quelle route casse
console.log("✅ Loading routes...");

app.use("/api/auth", authRoutes);
console.log("auth ok");

app.use("/api/products", productRoutes);
console.log("products ok");

app.use("/api/basket", basketRoutes);
console.log("basket ok");

app.use("/api/repairmen", repairmenRoutes);
console.log("repairmen ok");

app.use("/api/notifications", notificationsRoutes);
console.log("notifications ok");

app.use("/api/orders", orderRoutes);
console.log("orders ok");




app.use(cookieParser());
app.use(morgan("dev"));

// API Routes
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/basket", basketRoutes);
app.use("/api/repairmen", repairmenRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/orders", orderRoutes);

// Définir __dirname (car on est en ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New code: serve frontend from mounted location
app.use(express.static("/app/client/dist"));
app.use((req, res) => {
  res.sendFile("/app/client/dist/index.html");
});

// Lancer le serveur
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
