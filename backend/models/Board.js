const { query } = require("../config/db");

const Board = {
  /* ── Create ──────────────────────────────── */
  async create({ title, description, color, createdBy }) {
    const { rows } = await query(
      `INSERT INTO boards (title, description, color, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description || "", color || "#1a73e8", createdBy],
    );
    const board = rows[0];
    // Auto-add creator as member (owner role)
    await query(
      `INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [board.id, createdBy],
    );
    return board;
  },

  /* ── Read (list for a user) ─────────────── */
  async findAllForUser(userId, { search = "", page = 1, limit = 12 } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = "WHERE bm.user_id = $1";
    const params = [userId];

    if (search.trim()) {
      params.push(`%${search}%`);
      whereClause += ` AND (b.title ILIKE $${params.length} OR b.description ILIKE $${params.length})`;
    }

    const countResult = await query(
      `SELECT COUNT(DISTINCT b.id) as total
       FROM boards b
       JOIN board_members bm ON bm.board_id = b.id
       ${whereClause}`,
      params,
    );

    const total = parseInt(countResult.rows[0].total, 10);

    params.push(limit, offset);
    const { rows } = await query(
      `SELECT b.*,
              COALESCE(json_agg(json_build_object(
                'id', u.id, 'name', u.name, 'initials', u.initials, 'color', u.color
              )) FILTER (WHERE u.id IS NOT NULL), '[]') AS members
       FROM boards b
       JOIN board_members bm ON bm.board_id = b.id
       LEFT JOIN board_members bm2 ON bm2.board_id = b.id
       LEFT JOIN users u ON u.id = bm2.user_id
       ${whereClause}
       GROUP BY b.id
       ORDER BY b.updated_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return {
      boards: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /* ── Read one ───────────────────────────── */
  async findById(boardId) {
    const { rows } = await query(`SELECT * FROM boards WHERE id = $1`, [
      boardId,
    ]);
    return rows[0] || null;
  },

  /* ── Full detail (board + lists + tasks + members + labels) ── */
  async findFullDetail(boardId) {
    const board = await Board.findById(boardId);
    if (!board) return null;

    // Members
    const membersResult = await query(
      `SELECT u.id, u.name, u.email, u.avatar, u.initials, u.color, bm.role
       FROM board_members bm
       JOIN users u ON u.id = bm.user_id
       WHERE bm.board_id = $1
       ORDER BY bm.joined_at`,
      [boardId],
    );
    board.members = membersResult.rows;

    // Labels
    const labelsResult = await query(
      `SELECT * FROM labels WHERE board_id = $1 ORDER BY name`,
      [boardId],
    );
    board.labels = labelsResult.rows;

    // Lists with tasks
    const listsResult = await query(
      `SELECT * FROM lists WHERE board_id = $1 ORDER BY position`,
      [boardId],
    );

    for (const list of listsResult.rows) {
      const tasksResult = await query(
        `SELECT t.*,
                COALESCE(
                  (SELECT json_agg(ta.user_id) FROM task_assignees ta WHERE ta.task_id = t.id),
                  '[]'
                ) AS assignees,
                COALESCE(
                  (SELECT json_agg(tl.label_id) FROM task_labels tl WHERE tl.task_id = t.id),
                  '[]'
                ) AS labels
         FROM tasks t
         WHERE t.list_id = $1
         ORDER BY t.position`,
        [list.id],
      );
      list.tasks = tasksResult.rows;
    }
    board.lists = listsResult.rows;

    return board;
  },

  /* ── Update ─────────────────────────────── */
  async update(boardId, { title, description, color }) {
    const { rows } = await query(
      `UPDATE boards SET title = COALESCE($2, title),
                         description = COALESCE($3, description),
                         color = COALESCE($4, color),
                         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [boardId, title, description, color],
    );
    return rows[0] || null;
  },

  /* ── Delete ─────────────────────────────── */
  async delete(boardId) {
    await query(`DELETE FROM boards WHERE id = $1`, [boardId]);
  },

  /* ── Members ────────────────────────────── */
  async addMember(boardId, userId) {
    await query(
      `INSERT INTO board_members (board_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [boardId, userId],
    );
  },

  async removeMember(boardId, userId) {
    await query(
      `DELETE FROM board_members WHERE board_id = $1 AND user_id = $2`,
      [boardId, userId],
    );
  },

  async isMember(boardId, userId) {
    const { rows } = await query(
      `SELECT 1 FROM board_members WHERE board_id = $1 AND user_id = $2`,
      [boardId, userId],
    );
    return rows.length > 0;
  },
};

module.exports = Board;
