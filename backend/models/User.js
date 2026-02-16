const { query } = require("../config/db");

const User = {
  /**
   * Find a user by email address.
   * @param {string} email
   * @returns {object|null} user row or null
   */
  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return rows[0] || null;
  },

  /**
   * Find a user by primary key.
   * @param {string} id  UUID
   * @returns {object|null} user row (password excluded) or null
   */
  async findById(id) {
    const { rows } = await query(
      "SELECT id, name, email, avatar, initials, color, created_at FROM users WHERE id = $1",
      [id],
    );
    return rows[0] || null;
  },

  /**
   * Insert a new user row.
   * @param {{ name: string, email: string, password: string, initials: string, color: string }} data
   * @returns {object} the created user (password excluded)
   */
  async create({ name, email, password, initials, color }) {
    const { rows } = await query(
      `INSERT INTO users (name, email, password, initials, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, avatar, initials, color, created_at`,
      [name, email, password, initials, color],
    );
    return rows[0];
  },
};

module.exports = User;
