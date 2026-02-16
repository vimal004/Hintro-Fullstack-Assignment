const { query } = require("../config/db");

const Activity = {
  async create({ boardId, taskId, userId, action, detail }) {
    const { rows } = await query(
      `INSERT INTO activities (board_id, task_id, user_id, action, detail)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [boardId, taskId || null, userId, action, detail],
    );
    return rows[0];
  },

  async findByBoard(boardId, { page = 1, limit = 30 } = {}) {
    const offset = (page - 1) * limit;

    const countResult = await query(
      `SELECT COUNT(*) AS total FROM activities WHERE board_id = $1`,
      [boardId],
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const { rows } = await query(
      `SELECT a.*,
              json_build_object('id', u.id, 'name', u.name, 'initials', u.initials, 'color', u.color) AS user
       FROM activities a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.board_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [boardId, limit, offset],
    );

    return { activities: rows, total, page, limit };
  },
};

module.exports = Activity;
