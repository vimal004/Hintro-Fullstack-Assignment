const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * Run a parameterised SQL query.
 * @param {string} text  SQL string with $1, $2 … placeholders
 * @param {any[]}  params  values for the placeholders
 */
const query = (text, params) => pool.query(text, params);

/**
 * Ensure required tables exist (called once on server start).
 */
const initDB = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       VARCHAR(100)  NOT NULL,
      email      VARCHAR(255)  UNIQUE NOT NULL,
      password   VARCHAR(255)  NOT NULL,
      avatar     TEXT,
      initials   VARCHAR(4),
      color      VARCHAR(10),
      created_at TIMESTAMPTZ   DEFAULT NOW()
    );
  `);
  console.log("✅  Database initialised – users table ready");
};

module.exports = { query, initDB, pool };
