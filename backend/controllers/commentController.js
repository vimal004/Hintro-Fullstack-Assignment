const { query } = require("../config/db");

const CommentController = {
  /* ── GET /api/boards/:boardId/tasks/:taskId/comments ── */
  async getComments(req, res) {
    try {
      const { rows } = await query(
        `SELECT c.*, u.name as user_name, u.email as user_email, u.initials, u.color
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.task_id = $1
         ORDER BY c.created_at ASC`,
        [req.params.taskId],
      );
      res.json({ comments: rows });
    } catch (err) {
      console.error("getComments error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /* ── POST /api/boards/:boardId/tasks/:taskId/comments ── */
  async createComment(req, res) {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ message: "Comment text is required" });
      }

      const { rows } = await query(
        `INSERT INTO comments (task_id, user_id, text)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [req.params.taskId, req.user.id, text.trim()],
      );
      const comment = rows[0];

      // Get user info
      const userResult = await query(
        `SELECT name, email, initials, color FROM users WHERE id = $1`,
        [req.user.id],
      );
      const user = userResult.rows[0];
      comment.user_name = user.name;
      comment.user_email = user.email;
      comment.initials = user.initials;
      comment.color = user.color;

      // Server-side broadcast
      const io = req.app.get("io");
      if (io) {
        io.to(`board:${req.params.boardId}`).emit("comment:created", {
          boardId: req.params.boardId,
          taskId: req.params.taskId,
          comment,
          userId: req.user.id,
        });
      }

      res.status(201).json(comment);
    } catch (err) {
      console.error("createComment error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /* ── DELETE /api/boards/:boardId/tasks/:taskId/comments/:commentId ── */
  async deleteComment(req, res) {
    try {
      // Only author can delete their comment
      const { rows } = await query(
        `DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.commentId, req.user.id],
      );
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Comment not found or unauthorized" });
      }

      // Server-side broadcast
      const io = req.app.get("io");
      if (io) {
        io.to(`board:${req.params.boardId}`).emit("comment:deleted", {
          boardId: req.params.boardId,
          taskId: req.params.taskId,
          commentId: req.params.commentId,
          userId: req.user.id,
        });
      }

      res.json({ message: "Comment deleted" });
    } catch (err) {
      console.error("deleteComment error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = CommentController;
