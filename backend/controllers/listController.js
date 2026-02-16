const List = require("../models/List");
const Activity = require("../models/Activity");

/* ── POST /api/boards/:boardId/lists ─────── */
exports.createList = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const list = await List.create(req.params.boardId, title.trim());

    await Activity.create({
      boardId: req.params.boardId,
      userId: req.user.id,
      action: "created",
      detail: `Created list "${list.title}"`,
    });

    // Server-side broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.boardId}`).emit("list:created", {
        boardId: req.params.boardId,
        list,
        userId: req.user.id,
      });
    }

    res.status(201).json(list);
  } catch (err) {
    console.error("createList error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── PUT /api/boards/:boardId/lists/:listId ─ */
exports.updateList = async (req, res) => {
  try {
    const { title } = req.body;
    const list = await List.update(req.params.listId, { title });
    if (!list) return res.status(404).json({ message: "List not found" });

    // Server-side broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.boardId}`).emit("list:updated", {
        boardId: req.params.boardId,
        id: list.id,
        title: list.title,
        userId: req.user.id,
      });
    }

    res.json(list);
  } catch (err) {
    console.error("updateList error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── DELETE /api/boards/:boardId/lists/:listId */
exports.deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    await List.delete(req.params.listId);

    if (list) {
      await Activity.create({
        boardId: req.params.boardId,
        userId: req.user.id,
        action: "deleted",
        detail: `Deleted list "${list.title}"`,
      });
    }

    // Server-side broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.boardId}`).emit("list:deleted", {
        boardId: req.params.boardId,
        listId: req.params.listId,
        userId: req.user.id,
      });
    }

    res.json({ message: "List deleted" });
  } catch (err) {
    console.error("deleteList error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── PUT /api/boards/:boardId/lists/reorder ─ */
exports.reorderLists = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds array required" });
    }
    await List.reorder(req.params.boardId, orderedIds);

    // Server-side broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.boardId}`).emit("list:reordered", {
        boardId: req.params.boardId,
        orderedIds,
        userId: req.user.id,
      });
    }

    res.json({ message: "Lists reordered" });
  } catch (err) {
    console.error("reorderLists error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
