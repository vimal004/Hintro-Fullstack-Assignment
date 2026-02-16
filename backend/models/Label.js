const { query } = require("../config/db");

const Label = {
  async create(boardId, { name, color }) {
    const { rows } = await query(
      `INSERT INTO labels (board_id, name, color) VALUES ($1, $2, $3) RETURNING *`,
      [boardId, name, color || "#1a73e8"],
    );
    return rows[0];
  },

  async findByBoard(boardId) {
    const { rows } = await query(
      `SELECT * FROM labels WHERE board_id = $1 ORDER BY name`,
      [boardId],
    );
    return rows;
  },

  async update(labelId, { name, color }) {
    const { rows } = await query(
      `UPDATE labels SET name = COALESCE($2, name), color = COALESCE($3, color)
       WHERE id = $1 RETURNING *`,
      [labelId, name, color],
    );
    return rows[0] || null;
  },

  async delete(labelId) {
    await query(`DELETE FROM labels WHERE id = $1`, [labelId]);
  },
};

module.exports = Label;
