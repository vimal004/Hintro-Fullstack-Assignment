const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── Routes ──
app.use("/api/auth", authRoutes);

// ── Health check ──
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// ── Start ──
const start = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

// Initialize DB for Vercel serverless cold starts
initDB().catch((err) => console.error("DB init error:", err));

// Only listen when running locally (not on Vercel)
if (!process.env.VERCEL) {
  start();
}

// Export for Vercel serverless
module.exports = app;
