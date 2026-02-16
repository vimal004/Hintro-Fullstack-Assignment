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
    res.json({ message: "Lists reordered" });
  } catch (err) {
    console.error("reorderLists error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
