const Task = require("../models/Task");
const List = require("../models/List");
const Activity = require("../models/Activity");

/* ── POST /api/boards/:boardId/lists/:listId/tasks ── */
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignees, labels } =
      req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const task = await Task.create(req.params.listId, {
      title: title.trim(),
      description,
      priority,
      dueDate,
      assignees,
      labels,
    });

    await Activity.create({
      boardId: req.params.boardId,
      taskId: task.id,
      userId: req.user.id,
      action: "created",
      detail: `Created task "${task.title}"`,
    });

    // Server-side broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.boardId}`).emit("task:created", {
        boardId: req.params.boardId,
        listId: req.params.listId,
        task,
        userId: req.user.id,
      });
    }

    res.status(201).json(task);
  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── PUT /api/boards/:boardId/tasks/:taskId ────────── */
exports.updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignees,
      labels,
      isCompleted,
    } = req.body;
    const task = await Task.update(req.params.taskId, {
      title,
      description,
      priority,
      dueDate,
      assignees,
      labels,
      isCompleted,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Activity.create({
      boardId: req.params.boardId,
      taskId: task.id,
      userId: req.user.id,
      action: "updated",
      detail: `Updated task "${task.title}"`,
    });

    // Re-fetch to get full assignees/labels
    const full = await Task.findById(task.id);

    // Server-side broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.boardId}`).emit("task:updated", {
        boardId: req.params.boardId,
        listId: task.list_id,
        task: full,
        userId: req.user.id,
      });
    }

    res.json(full);
  } catch (err) {
    console.error("updateTask error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── DELETE /api/boards/:boardId/tasks/:taskId ─────── */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    const listId = task?.list_id;
    await Task.delete(req.params.taskId);

    if (task) {
      await Activity.create({
        boardId: req.params.boardId,
        taskId: task.id,
        userId: req.user.id,
        action: "deleted",
        detail: `Deleted task "${task.title}"`,
      });
    }

    // Server-side broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.boardId}`).emit("task:deleted", {
        boardId: req.params.boardId,
        listId,
        taskId: req.params.taskId,
        userId: req.user.id,
      });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── PUT /api/boards/:boardId/tasks/:taskId/move ───── */
exports.moveTask = async (req, res) => {
  try {
    const { destListId, destPosition } = req.body;
    if (!destListId || destPosition === undefined) {
      return res
        .status(400)
        .json({ message: "destListId and destPosition required" });
    }

    const task = await Task.findById(req.params.taskId);
    const srcList = task ? await List.findById(task.list_id) : null;
    const destList = await List.findById(destListId);

    const moved = await Task.move(req.params.taskId, {
      destListId,
      destPosition: parseInt(destPosition, 10),
    });
    if (!moved) return res.status(404).json({ message: "Task not found" });

    if (srcList && destList && srcList.id !== destList.id) {
      await Activity.create({
        boardId: req.params.boardId,
        taskId: moved.id,
        userId: req.user.id,
        action: "moved",
        detail: `Moved "${moved.title}" from ${srcList.title} to ${destList.title}`,
      });
    }

    // Server-side broadcast
    const io = req.app.get("io");
    if (io) {
      io.to(`board:${req.params.boardId}`).emit("task:moved", {
        boardId: req.params.boardId,
        taskId: req.params.taskId,
        sourceListId: task?.list_id,
        destListId,
        destPosition,
        userId: req.user.id,
      });
    }

    res.json(moved);
  } catch (err) {
    console.error("moveTask error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
