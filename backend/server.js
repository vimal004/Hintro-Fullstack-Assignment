const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { initDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const boardRoutes = require("./routes/boardRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ── CORS Origins ──
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://hintro-fullstack-assignment.vercel.app",
];

// ── Express Middleware ──
app.use(
  cors({
    origin: (origin, callback) => {
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

// ── REST Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Health check ──
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// ── Socket.IO ──
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Socket.IO auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication required"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.user.email} (${socket.id})`);

  // Join personal room for notifications
  socket.join(`user:${socket.user.id}`);

  // Join board room
  socket.on("join-board", (boardId) => {
    socket.join(`board:${boardId}`);
    // Notify others
    socket.to(`board:${boardId}`).emit("user:joined", {
      userId: socket.user.id,
      email: socket.user.email,
    });
    console.log(`  → ${socket.user.email} joined board:${boardId}`);
  });

  // Leave board room
  socket.on("leave-board", (boardId) => {
    socket.leave(`board:${boardId}`);
    socket.to(`board:${boardId}`).emit("user:left", {
      userId: socket.user.id,
    });
  });

  // Board events — relay to room
  const boardEvents = [
    "board:updated",
    "list:created",
    "list:updated",
    "list:deleted",
    "list:reordered",
    "task:created",
    "task:updated",
    "task:deleted",
    "task:moved",
    "member:added",
    "member:removed",
    "activity:new",
    "label:created",
    "label:updated",
    "label:deleted",
  ];

  for (const event of boardEvents) {
    socket.on(event, (data) => {
      if (data.boardId) {
        // Broadcast to everyone in the room except sender
        socket.to(`board:${data.boardId}`).emit(event, data);
      }
    });
  }

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.user.email}`);
  });
});

// Make io accessible to controllers if needed
app.set("io", io);

// ── Start ──
const start = async () => {
  try {
    await initDB();
    server.listen(PORT, () => {
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
