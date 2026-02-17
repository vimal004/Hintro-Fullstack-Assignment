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
  pingInterval: 10000,
  pingTimeout: 5000,
});

// Track online users per board for presence
const boardPresence = new Map(); // boardId -> Map<socketId, { userId, email, name, color, initials }>

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

  // ── Join board room with presence ──
  socket.on("join-board", (boardId) => {
    socket.join(`board:${boardId}`);
    socket.currentBoard = boardId;

    // Track presence
    if (!boardPresence.has(boardId)) {
      boardPresence.set(boardId, new Map());
    }
    const presence = boardPresence.get(boardId);
    presence.set(socket.id, {
      userId: socket.user.id,
      email: socket.user.email,
      name: socket.user.name || socket.user.email,
      color: socket.user.color,
      initials: socket.user.initials,
      joinedAt: Date.now(),
    });

    // Send current presence list to the joiner
    const onlineUsers = Array.from(presence.values());
    socket.emit("presence:list", { boardId, users: onlineUsers });

    // Notify others
    socket.to(`board:${boardId}`).emit("presence:joined", {
      boardId,
      user: {
        userId: socket.user.id,
        email: socket.user.email,
        name: socket.user.name || socket.user.email,
        color: socket.user.color,
        initials: socket.user.initials,
      },
    });

    console.log(
      `  → ${socket.user.email} joined board:${boardId} (${presence.size} online)`,
    );
  });

  // ── Leave board room ──
  socket.on("leave-board", (boardId) => {
    socket.leave(`board:${boardId}`);
    socket.currentBoard = null;

    // Clean up presence
    const presence = boardPresence.get(boardId);
    if (presence) {
      presence.delete(socket.id);
      if (presence.size === 0) {
        boardPresence.delete(boardId);
      }
    }

    socket.to(`board:${boardId}`).emit("presence:left", {
      boardId,
      userId: socket.user.id,
    });
  });

  // ── Typing indicators ──
  socket.on("typing:start", (data) => {
    if (data.boardId) {
      socket.to(`board:${data.boardId}`).emit("typing:start", {
        userId: socket.user.id,
        userName: socket.user.name || socket.user.email,
        field: data.field, // 'task:title', 'task:description', 'list:title', etc.
        targetId: data.targetId,
        boardId: data.boardId,
      });
    }
  });

  socket.on("typing:stop", (data) => {
    if (data.boardId) {
      socket.to(`board:${data.boardId}`).emit("typing:stop", {
        userId: socket.user.id,
        field: data.field,
        targetId: data.targetId,
        boardId: data.boardId,
      });
    }
  });

  // ── Board events — relay to room ──
  // These are used as FALLBACK only; primary broadcasting is done by controllers via io
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
    "comment:created",
    "board:favorited",
    "board:unfavorited",
  ];

  for (const event of boardEvents) {
    socket.on(event, (data) => {
      if (data.boardId) {
        // Broadcast to everyone in the room except sender
        socket.to(`board:${data.boardId}`).emit(event, data);
      }
    });
  }

  // ── Disconnect ──
  socket.on("disconnect", () => {
    // Clean up presence from all boards
    for (const [boardId, presence] of boardPresence.entries()) {
      if (presence.has(socket.id)) {
        presence.delete(socket.id);
        io.to(`board:${boardId}`).emit("presence:left", {
          boardId,
          userId: socket.user.id,
        });
        if (presence.size === 0) {
          boardPresence.delete(boardId);
        }
      }
    }
    console.log(`🔌 Socket disconnected: ${socket.user.email}`);
  });
});

// Make io accessible to controllers for server-side broadcasting
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
if (process.env.VERCEL) {
  initDB().catch((err) => console.error("DB init error:", err));
}

// Only listen when running locally or on Render (not on Vercel) and not in test mode
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  start();
}

// Export for Vercel serverless
module.exports = app;
