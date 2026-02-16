const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * Run a parameterised SQL query.
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

    CREATE TABLE IF NOT EXISTS boards (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       VARCHAR(200)  NOT NULL,
      description TEXT          DEFAULT '',
      color       VARCHAR(10)   DEFAULT '#1a73e8',
      created_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMPTZ   DEFAULT NOW(),
      updated_at  TIMESTAMPTZ   DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS board_members (
      board_id   UUID REFERENCES boards(id) ON DELETE CASCADE,
      user_id    UUID REFERENCES users(id)  ON DELETE CASCADE,
      role       VARCHAR(20) DEFAULT 'member',
      joined_at  TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (board_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS lists (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      board_id   UUID REFERENCES boards(id) ON DELETE CASCADE,
      title      VARCHAR(200)  NOT NULL,
      position   INTEGER       NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ   DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      list_id     UUID REFERENCES lists(id) ON DELETE CASCADE,
      title       VARCHAR(500)  NOT NULL,
      description TEXT          DEFAULT '',
      priority    VARCHAR(10)   DEFAULT 'medium',
      due_date    DATE,
      position    INTEGER       NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ   DEFAULT NOW(),
      updated_at  TIMESTAMPTZ   DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS task_assignees (
      task_id  UUID REFERENCES tasks(id) ON DELETE CASCADE,
      user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS labels (
      id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
      name     VARCHAR(50) NOT NULL,
      color    VARCHAR(10) DEFAULT '#1a73e8'
    );

    CREATE TABLE IF NOT EXISTS task_labels (
      task_id  UUID REFERENCES tasks(id)  ON DELETE CASCADE,
      label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, label_id)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      board_id   UUID REFERENCES boards(id) ON DELETE CASCADE,
      task_id    UUID,
      user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
      action     VARCHAR(50)  NOT NULL,
      detail     TEXT         NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS teams (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          VARCHAR(100) NOT NULL,
      created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS team_members (
      team_id    UUID REFERENCES teams(id) ON DELETE CASCADE,
      user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
      role       VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member'
      joined_at  TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (team_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS invitations (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email      VARCHAR(255) NOT NULL,
      team_id    UUID REFERENCES teams(id) ON DELETE CASCADE,
      invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
      status     VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(email, team_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
      type       VARCHAR(50)  NOT NULL,
      title      VARCHAR(255) NOT NULL,
      message    TEXT         NOT NULL,
      data       JSONB        DEFAULT '{}',
      is_read    BOOLEAN      DEFAULT FALSE,
      status     VARCHAR(20)  DEFAULT 'pending',
      created_at TIMESTAMPTZ  DEFAULT NOW()
    );

    -- ── New tables for novel features ──

    CREATE TABLE IF NOT EXISTS comments (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id    UUID REFERENCES tasks(id) ON DELETE CASCADE,
      user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
      text       TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS board_favorites (
      board_id   UUID REFERENCES boards(id) ON DELETE CASCADE,
      user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (board_id, user_id)
    );

    -- Upgrade boards table if needed (idempotent-ish)
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='boards' AND column_name='team_id') THEN
        ALTER TABLE boards ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
        CREATE INDEX idx_boards_team ON boards(team_id);
      END IF;
    END $$;

    -- Upgrade invitations table: add unique constraint (idempotent)
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invitations_email_team_id_key'
      ) THEN
        ALTER TABLE invitations ADD CONSTRAINT invitations_email_team_id_key UNIQUE (email, team_id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- ignore if it already exists or table doesn't exist yet
    END $$;

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_board_members_user   ON board_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_lists_board          ON lists(board_id, position);
    CREATE INDEX IF NOT EXISTS idx_tasks_list           ON tasks(list_id, position);
    CREATE INDEX IF NOT EXISTS idx_task_assignees_user  ON task_assignees(user_id);
    CREATE INDEX IF NOT EXISTS idx_labels_board         ON labels(board_id);
    CREATE INDEX IF NOT EXISTS idx_task_labels_label    ON task_labels(label_id);
    CREATE INDEX IF NOT EXISTS idx_activities_board     ON activities(board_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_boards_created_by    ON boards(created_by);

    CREATE INDEX IF NOT EXISTS idx_team_members_user    ON team_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_invitations_email    ON invitations(email);
    CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comments_task        ON comments(task_id, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_board_favorites_user ON board_favorites(user_id);
  `);
  console.log("✅  Database initialised – all tables ready");
};

module.exports = { query, initDB, pool };
