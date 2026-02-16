const { query } = require("../config/db");

const SAFE_COLS = "id, name, email, avatar, initials, color, created_at";

const User = {
  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT ${SAFE_COLS} FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] || null;
  },

  async create({ name, email, password, initials, color }) {
    const { rows } = await query(
      `INSERT INTO users (name, email, password, initials, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SAFE_COLS}`,
      [name, email, password, initials, color],
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await query(
      `SELECT ${SAFE_COLS} FROM users ORDER BY name`,
    );
    return rows;
  },

  async search(term) {
    const { rows } = await query(
      `SELECT ${SAFE_COLS} FROM users
       WHERE name ILIKE $1 OR email ILIKE $1
       ORDER BY name LIMIT 20`,
      [`%${term}%`],
    );
    return rows;
  },
};

module.exports = User;
