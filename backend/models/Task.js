const { query } = require("../config/db");

const Task = {
  /* ── Create ─────────────────────────────── */
  async create(
    listId,
    { title, description, priority, dueDate, assignees, labels },
  ) {
    const posResult = await query(
      `SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM tasks WHERE list_id = $1`,
      [listId],
    );
    const position = posResult.rows[0].next_pos;

    const { rows } = await query(
      `INSERT INTO tasks (list_id, title, description, priority, due_date, position)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        listId,
        title,
        description || "",
        priority || "medium",
        dueDate || null,
        position,
      ],
    );
    const task = rows[0];

    // Assignees
    if (assignees && assignees.length > 0) {
      for (const userId of assignees) {
        await query(
          `INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [task.id, userId],
        );
      }
    }

    // Labels
    if (labels && labels.length > 0) {
      for (const labelId of labels) {
        await query(
          `INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [task.id, labelId],
        );
      }
    }

    task.assignees = assignees || [];
    task.labels = labels || [];
    return task;
  },

  /* ── Read ───────────────────────────────── */
  async findById(taskId) {
    const { rows } = await query(
      `SELECT t.*, t.is_completed,
              COALESCE((SELECT json_agg(ta.user_id) FROM task_assignees ta WHERE ta.task_id = t.id), '[]') AS assignees,
              COALESCE((SELECT json_agg(tl.label_id) FROM task_labels tl WHERE tl.task_id = t.id), '[]') AS labels
       FROM tasks t WHERE t.id = $1`,
      [taskId],
    );
    return rows[0] || null;
  },

  /* ── Update ─────────────────────────────── */
  async update(
    taskId,
    { title, description, priority, dueDate, assignees, labels, isCompleted },
  ) {
    const { rows } = await query(
      `UPDATE tasks SET
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         priority = COALESCE($4, priority),
         due_date = $5,
         is_completed = COALESCE($6, is_completed),
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [taskId, title, description, priority, dueDate, isCompleted],
    );
    const task = rows[0];
    if (!task) return null;

    // Sync assignees
    if (assignees !== undefined) {
      await query(`DELETE FROM task_assignees WHERE task_id = $1`, [taskId]);
      for (const userId of assignees) {
        await query(
          `INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [taskId, userId],
        );
      }
      task.assignees = assignees;
    }

    // Sync labels
    if (labels !== undefined) {
      await query(`DELETE FROM task_labels WHERE task_id = $1`, [taskId]);
      for (const labelId of labels) {
        await query(
          `INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [taskId, labelId],
        );
      }
      task.labels = labels;
    }

    return task;
  },

  /* ── Delete ─────────────────────────────── */
  async delete(taskId) {
    await query(`DELETE FROM tasks WHERE id = $1`, [taskId]);
  },

  /* ── Move (between lists or reorder) ───── */
  async move(taskId, { destListId, destPosition }) {
    // Get current task
    const task = await Task.findById(taskId);
    if (!task) return null;

    const srcListId = task.list_id;

    // Remove from source position (shift others up)
    await query(
      `UPDATE tasks SET position = position - 1
       WHERE list_id = $1 AND position > $2`,
      [srcListId, task.position],
    );

    // Make room at dest (shift others down)
    await query(
      `UPDATE tasks SET position = position + 1
       WHERE list_id = $1 AND position >= $2`,
      [destListId, destPosition],
    );

    // Move the task
    await query(
      `UPDATE tasks SET list_id = $1, position = $2, updated_at = NOW()
       WHERE id = $3`,
      [destListId, destPosition, taskId],
    );

    return { ...task, list_id: destListId, position: destPosition };
  },
};

module.exports = Task;
