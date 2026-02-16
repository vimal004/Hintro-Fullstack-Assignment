const Board = require("../models/Board");
const Activity = require("../models/Activity");

/* ── GET /api/boards ─────────────────────── */
exports.getBoards = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const result = await Board.findAllForUser(req.user.id, {
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
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
    res.json(board);
  } catch (err) {
    console.error("updateBoard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── DELETE /api/boards/:id ──────────────── */
exports.deleteBoard = async (req, res) => {
  try {
    await Board.delete(req.params.id);
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
    res.json({ message: "Member removed" });
  } catch (err) {
    console.error("removeMember error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
