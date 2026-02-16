const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
const allowedOrigins = [
  "http://localhost:5173",
  "https://hintro-fullstack-assignment.vercel.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
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
