const { query } = require("../config/db");

const Board = {
  /* ── Create ──────────────────────────────── */
  async create({ title, description, color, createdBy, teamId }) {
    const { rows } = await query(
      `INSERT INTO boards (title, description, color, created_by, team_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description || "", color || "#1a73e8", createdBy, teamId || null],
    );
    const board = rows[0];

    await query(
      `INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [board.id, createdBy],
    );
    return board;
  },

  /* ── Read (list for a user) ─────────────── */
  async findAllForUser(
    userId,
    { search = "", page = 1, limit = 12, teamId = null } = {},
  ) {
    const offset = (page - 1) * limit;
    let whereClause = `
      WHERE (
        bm.user_id = $1
        OR
        b.team_id IN (SELECT team_id FROM team_members WHERE user_id = $1)
      )
    `;
    const params = [userId];

    // Filter by team
    if (teamId === "personal") {
      whereClause += ` AND b.team_id IS NULL`;
    } else if (teamId) {
      params.push(teamId);
      whereClause += ` AND b.team_id = $${params.length}`;
    }

    if (search.trim()) {
      params.push(`%${search}%`);
      whereClause += ` AND (b.title ILIKE $${params.length} OR b.description ILIKE $${params.length})`;
    }

    const countResult = await query(
      `SELECT COUNT(DISTINCT b.id) as total
       FROM boards b
       LEFT JOIN board_members bm ON bm.board_id = b.id
       ${whereClause}`,
      params,
    );

    const total = parseInt(countResult.rows[0].total, 10);

    params.push(limit, offset);
    const { rows } = await query(
      `SELECT b.*,
              COALESCE(json_agg(DISTINCT jsonb_build_object(
                'id', u.id, 'name', u.name, 'initials', u.initials, 'color', u.color
              )) FILTER (WHERE u.id IS NOT NULL), '[]') AS members,
              EXISTS(SELECT 1 FROM board_favorites bf WHERE bf.board_id = b.id AND bf.user_id = $1) AS is_favorited
       FROM boards b
       LEFT JOIN board_members bm ON bm.board_id = b.id
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

    // Members (include board-specific members AND team members)
    const membersResult = await query(
      `SELECT DISTINCT ON (u.id) u.id, u.name, u.email, u.avatar, u.initials, u.color,
              COALESCE(bm.role, tm.role, 'member') as role
       FROM users u
       LEFT JOIN board_members bm ON bm.user_id = u.id AND bm.board_id = $1
       LEFT JOIN boards b ON b.id = $1
       LEFT JOIN team_members tm ON tm.team_id = b.team_id AND tm.user_id = u.id
       WHERE bm.board_id = $1 OR (b.team_id IS NOT NULL AND tm.team_id = b.team_id)
       ORDER BY u.id`,
      [boardId],
    );
    board.members = membersResult.rows;

    // Labels
    const labelsResult = await query(
      `SELECT * FROM labels WHERE board_id = $1 ORDER BY name`,
      [boardId],
    );
    board.labels = labelsResult.rows;

    // Lists with tasks (optimized single query for tasks)
    const listsResult = await query(
      `SELECT * FROM lists WHERE board_id = $1 ORDER BY position`,
      [boardId],
    );

    // Fetch all tasks for the board in one query
    const listIds = listsResult.rows.map((l) => l.id);
    let allTasks = [];
    if (listIds.length > 0) {
      const tasksResult = await query(
        `SELECT t.*,
                COALESCE(
                  (SELECT json_agg(ta.user_id) FROM task_assignees ta WHERE ta.task_id = t.id),
                  '[]'
                ) AS assignees,
                COALESCE(
                  (SELECT json_agg(tl.label_id) FROM task_labels tl WHERE tl.task_id = t.id),
                  '[]'
                ) AS labels,
                (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) AS comments_count
         FROM tasks t
         WHERE t.list_id = ANY($1)
         ORDER BY t.position`,
        [listIds],
      );
      allTasks = tasksResult.rows;
    }

    // Group tasks by list
    for (const list of listsResult.rows) {
      list.tasks = allTasks.filter((t) => t.list_id === list.id);
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

  /* ── Favorites ──────────────────────────── */
  async toggleFavorite(boardId, userId) {
    // Check if already favorited
    const { rows } = await query(
      `SELECT 1 FROM board_favorites WHERE board_id = $1 AND user_id = $2`,
      [boardId, userId],
    );
    if (rows.length > 0) {
      await query(
        `DELETE FROM board_favorites WHERE board_id = $1 AND user_id = $2`,
        [boardId, userId],
      );
      return false;
    } else {
      await query(
        `INSERT INTO board_favorites (board_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [boardId, userId],
      );
      return true;
    }
  },

  async getUserFavorites(userId) {
    const { rows } = await query(
      `SELECT board_id FROM board_favorites WHERE user_id = $1`,
      [userId],
    );
    return rows.map((r) => r.board_id);
  },

  /* ── Duplicate Board ────────────────────── */
  async duplicate(boardId, userId) {
    const original = await Board.findFullDetail(boardId);
    if (!original) return null;

    // Create new board
    const newBoard = await Board.create({
      title: `${original.title} (Copy)`,
      description: original.description,
      color: original.color,
      createdBy: userId,
      teamId: original.team_id || null,
    });

    // Copy lists and tasks
    for (const list of original.lists || []) {
      const newListResult = await query(
        `INSERT INTO lists (board_id, title, position) VALUES ($1, $2, $3) RETURNING *`,
        [newBoard.id, list.title, list.position],
      );
      const newList = newListResult.rows[0];

      for (const task of list.tasks || []) {
        await query(
          `INSERT INTO tasks (list_id, title, description, priority, due_date, position)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            newList.id,
            task.title,
            task.description,
            task.priority,
            task.due_date,
            task.position,
          ],
        );
      }
    }

    // Copy labels
    for (const label of original.labels || []) {
      await query(
        `INSERT INTO labels (board_id, name, color) VALUES ($1, $2, $3)`,
        [newBoard.id, label.name, label.color],
      );
    }

    return newBoard;
  },
};

module.exports = Board;
