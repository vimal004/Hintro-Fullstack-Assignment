const Board = require("../models/Board");
const Activity = require("../models/Activity");
const { query } = require("../config/db");

/* ── GET /api/boards ─────────────────────── */
exports.getBoards = async (req, res) => {
  try {
    const { search, page = 1, limit = 12, teamId } = req.query;
    const result = await Board.findAllForUser(req.user.id, {
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      teamId: teamId || null,
    });
    res.json(result);
  } catch (err) {
    console.error("getBoards error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── POST /api/boards ────────────────────── */
exports.createBoard = async (req, res) => {
  try {
    const { title, description, color, teamId } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const board = await Board.create({
      title: title.trim(),
      description: description || "",
      color: color || "#1a73e8",
      createdBy: req.user.id,
      teamId: teamId || null,
    });

    await Activity.create({
      boardId: board.id,
      userId: req.user.id,
      action: "created",
      detail: `Created board "${board.title}"`,
    });

    // Return full detail
    const full = await Board.findFullDetail(board.id);

    // Broadcast to team members if it's a team board
    const io = req.app.get("io");
    if (io && teamId) {
      io.emit("board:created", { board: full });
    }

    res.status(201).json(full);
  } catch (err) {
    console.error("createBoard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── GET /api/boards/:id ─────────────────── */
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findFullDetail(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (err) {
    console.error("getBoard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── PUT /api/boards/:id ─────────────────── */
exports.updateBoard = async (req, res) => {
  try {
    const { title, description, color } = req.body;
    const board = await Board.update(req.params.id, {
      title,
      description,
      color,
    });
    if (!board) return res.status(404).json({ message: "Board not found" });

    // Server-side broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.id}`).emit("board:updated", {
        boardId: req.params.id,
        board,
      });
    }

    res.json(board);
  } catch (err) {
    console.error("updateBoard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── DELETE /api/boards/:id ──────────────── */
exports.deleteBoard = async (req, res) => {
  try {
    const boardId = req.params.id;

    // Broadcast before deleting
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${boardId}`).emit("board:deleted", { boardId });
    }

    await Board.delete(boardId);
    res.json({ message: "Board deleted" });
  } catch (err) {
    console.error("deleteBoard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── POST /api/boards/:id/members ────────── */
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    await Board.addMember(req.params.id, userId);

    await Activity.create({
      boardId: req.params.id,
      userId: req.user.id,
      action: "member_added",
      detail: `Added a member to the board`,
    });

    const board = await Board.findFullDetail(req.params.id);

    // Broadcast member change
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.id}`).emit("member:added", {
        boardId: req.params.id,
        members: board.members,
      });
    }

    res.json(board.members);
  } catch (err) {
    console.error("addMember error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── DELETE /api/boards/:id/members/:userId  */
exports.removeMember = async (req, res) => {
  try {
    await Board.removeMember(req.params.id, req.params.userId);

    // Broadcast member change
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.id}`).emit("member:removed", {
        boardId: req.params.id,
        userId: req.params.userId,
      });
    }

    res.json({ message: "Member removed" });
  } catch (err) {
    console.error("removeMember error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── POST /api/boards/:id/favorite ────────── */
exports.toggleFavorite = async (req, res) => {
  try {
    const boardId = req.params.id;
    const userId = req.user.id;
    const isFavorited = await Board.toggleFavorite(boardId, userId);
    res.json({ isFavorited });
  } catch (err) {
    console.error("toggleFavorite error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── GET /api/boards/favorites ─────────────── */
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Board.getUserFavorites(req.user.id);
    res.json({ favorites });
  } catch (err) {
    console.error("getFavorites error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── POST /api/boards/:id/duplicate ──────── */
exports.duplicateBoard = async (req, res) => {
  try {
    const boardId = req.params.id;
    const userId = req.user.id;
    const newBoard = await Board.duplicate(boardId, userId);
    if (!newBoard) return res.status(404).json({ message: "Board not found" });

    const full = await Board.findFullDetail(newBoard.id);
    res.status(201).json(full);
  } catch (err) {
    console.error("duplicateBoard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
