const { query } = require("../config/db");

const NotificationController = {
  /* ── Get My Notifications ─────────────── */
  async getNotifications(req, res) {
    const userId = req.user.id;

    try {
      const { rows } = await query(
        `SELECT * FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [userId],
      );
      res.json({ notifications: rows });
    } catch (err) {
      console.error("getNotifications error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ── Get Unread Count ─────────────────── */
  async getUnreadCount(req, res) {
    const userId = req.user.id;

    try {
      const { rows } = await query(
        `SELECT COUNT(*) as count FROM notifications
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId],
      );
      res.json({ count: parseInt(rows[0].count, 10) });
    } catch (err) {
      console.error("getUnreadCount error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ── Mark As Read ─────────────────────── */
  async markAsRead(req, res) {
    const userId = req.user.id;
    const { id } = req.params;

    try {
      await query(
        `UPDATE notifications SET is_read = TRUE
         WHERE id = $1 AND user_id = $2`,
        [id, userId],
      );
      res.json({ message: "Marked as read" });
    } catch (err) {
      console.error("markAsRead error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ── Mark All As Read ─────────────────── */
  async markAllAsRead(req, res) {
    const userId = req.user.id;

    try {
      await query(
        `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
        [userId],
      );
      res.json({ message: "All marked as read" });
    } catch (err) {
      console.error("markAllAsRead error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ── Accept Team Invite ───────────────── */
  async acceptInvite(req, res) {
    const userId = req.user.id;
    const { id } = req.params; // notification id

    try {
      // 1. Get the notification
      const notifResult = await query(
        `SELECT * FROM notifications WHERE id = $1 AND user_id = $2`,
        [id, userId],
      );

      if (notifResult.rows.length === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const notif = notifResult.rows[0];

      if (notif.type !== "team_invite") {
        return res
          .status(400)
          .json({ message: "This notification is not a team invite" });
      }

      if (notif.status !== "pending") {
        return res
          .status(400)
          .json({ message: `Invite already ${notif.status}` });
      }

      const teamId = notif.data?.teamId;
      if (!teamId) {
        return res.status(400).json({ message: "Invalid notification data" });
      }

      // 2. Check if team still exists
      const teamCheck = await query(`SELECT name FROM teams WHERE id = $1`, [
        teamId,
      ]);
      if (teamCheck.rows.length === 0) {
        // Team was deleted — mark notification as declined
        await query(
          `UPDATE notifications SET status = 'declined', is_read = TRUE WHERE id = $1`,
          [id],
        );
        return res.status(400).json({ message: "This team no longer exists" });
      }

      // 3. Check if already a member
      const memberCheck = await query(
        `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`,
        [teamId, userId],
      );
      if (memberCheck.rows.length > 0) {
        await query(
          `UPDATE notifications SET status = 'accepted', is_read = TRUE WHERE id = $1`,
          [id],
        );
        return res.json({ message: "You're already a member of this team" });
      }

      // 4. Add user to team
      await query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member')`,
        [teamId, userId],
      );

      // 5. Update notification status
      await query(
        `UPDATE notifications SET status = 'accepted', is_read = TRUE WHERE id = $1`,
        [id],
      );

      // 6. Also update invitation record if exists
      const userEmail = await query(`SELECT email FROM users WHERE id = $1`, [
        userId,
      ]);
      if (userEmail.rows.length > 0) {
        await query(
          `UPDATE invitations SET status = 'accepted' WHERE email = $1 AND team_id = $2`,
          [userEmail.rows[0].email, teamId],
        );
      }

      res.json({
        message: `You've joined ${teamCheck.rows[0].name}!`,
        teamId,
        teamName: teamCheck.rows[0].name,
      });
    } catch (err) {
      console.error("acceptInvite error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ── Decline Team Invite ──────────────── */
  async declineInvite(req, res) {
    const userId = req.user.id;
    const { id } = req.params; // notification id

    try {
      const notifResult = await query(
        `SELECT * FROM notifications WHERE id = $1 AND user_id = $2`,
        [id, userId],
      );

      if (notifResult.rows.length === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }

      const notif = notifResult.rows[0];

      if (notif.status !== "pending") {
        return res
          .status(400)
          .json({ message: `Invite already ${notif.status}` });
      }

      // Update notification
      await query(
        `UPDATE notifications SET status = 'declined', is_read = TRUE WHERE id = $1`,
        [id],
      );

      // Update invitation record
      const teamId = notif.data?.teamId;
      if (teamId) {
        const userEmail = await query(`SELECT email FROM users WHERE id = $1`, [
          userId,
        ]);
        if (userEmail.rows.length > 0) {
          await query(
            `UPDATE invitations SET status = 'declined' WHERE email = $1 AND team_id = $2`,
            [userEmail.rows[0].email, teamId],
          );
        }
      }

      res.json({ message: "Invite declined" });
    } catch (err) {
      console.error("declineInvite error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = NotificationController;
