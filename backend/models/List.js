const { query } = require("../config/db");

const List = {
  async create(boardId, title) {
    // Get next position
    const posResult = await query(
      `SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM lists WHERE board_id = $1`,
      [boardId],
    );
    const position = posResult.rows[0].next_pos;

    const { rows } = await query(
      `INSERT INTO lists (board_id, title, position)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [boardId, title, position],
    );
    return { ...rows[0], tasks: [] };
  },

  async findById(listId) {
    const { rows } = await query(`SELECT * FROM lists WHERE id = $1`, [listId]);
    return rows[0] || null;
  },

  async update(listId, { title }) {
    const { rows } = await query(
      `UPDATE lists SET title = COALESCE($2, title) WHERE id = $1 RETURNING *`,
      [listId, title],
    );
    return rows[0] || null;
  },

  async delete(listId) {
    await query(`DELETE FROM lists WHERE id = $1`, [listId]);
  },

  async reorder(boardId, orderedIds) {
    // orderedIds is an array of list UUIDs in the desired order
    for (let i = 0; i < orderedIds.length; i++) {
      await query(
        `UPDATE lists SET position = $1 WHERE id = $2 AND board_id = $3`,
        [i, orderedIds[i], boardId],
      );
    }
  },
};

module.exports = List;
