const { query } = require("../config/db");

const TeamController = {
  /* ── Create Team ────────────────────────── */
  async createTeam(req, res) {
    const { name } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!name)
      return res.status(400).json({ message: "Team name is required" });

    try {
      // 1. Create Team
      const teamResult = await query(
        `INSERT INTO teams (name, created_by) VALUES ($1, $2) RETURNING *`,
        [name, userId],
      );
      const team = teamResult.rows[0];

      // 2. Add creator as 'owner'
      await query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'owner')`,
        [team.id, userId],
      );

      res.status(201).json({ team });
    } catch (err) {
      console.error("createTeam error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ── Get My Teams ───────────────────────── */
  async getMyTeams(req, res) {
    const userId = req.user.id;

    try {
      const { rows } = await query(
        `SELECT t.*, tm.role, tm.joined_at,
                (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
         FROM teams t
         JOIN team_members tm ON tm.team_id = t.id
         WHERE tm.user_id = $1
         ORDER BY t.created_at DESC`,
        [userId],
      );

      res.json({ teams: rows });
    } catch (err) {
      console.error("getMyTeams error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ── Get Team Members ───────────────────── */
  async getTeamMembers(req, res) {
    const { teamId } = req.params;
    const userId = req.user.id;

    try {
      // Check if user is member of team
      const memberCheck = await query(
        `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`,
        [teamId, userId],
      );
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { rows } = await query(
        `SELECT u.id, u.name, u.email, u.avatar, u.initials, u.color, tm.role, tm.joined_at
         FROM team_members tm
         JOIN users u ON u.id = tm.user_id
         WHERE tm.team_id = $1
         ORDER BY tm.role DESC, u.name ASC`, // owner first
        [teamId],
      );

      res.json({ members: rows });
    } catch (err) {
      console.error("getTeamMembers error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ── Invite Member (sends in-app notification) ── */
  async inviteMember(req, res) {
    const { teamId } = req.params;
    const { email: rawEmail } = req.body;
    const userId = req.user.id;

    if (!rawEmail)
      return res.status(400).json({ message: "Email is required" });
    const email = rawEmail.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    try {
      // 1. Check permissions (must be member of team)
      const roleCheck = await query(
        `SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2`,
        [teamId, userId],
      );
      if (roleCheck.rows.length === 0) {
        return res.status(403).json({ message: "Access denied" });
      }

      // 2. Check if user exists (case-insensitive)
      const userResult = await query(
        `SELECT id, name, email FROM users WHERE LOWER(email) = $1`,
        [email],
      );
      const userToInvite = userResult.rows[0];

      if (!userToInvite) {
        return res.status(404).json({
          message:
            "No user found with this email. Only registered users can be invited.",
          code: "USER_NOT_FOUND",
        });
      }

      // 3. Can't invite yourself
      if (userToInvite.id === userId) {
        return res.status(400).json({ message: "You can't invite yourself" });
      }

      // 4. Check if already member
      const existingMember = await query(
        `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`,
        [teamId, userToInvite.id],
      );
      if (existingMember.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "This user is already a member of the team" });
      }

      // 5. Check if there's already a pending invite notification
      const existingNotif = await query(
        `SELECT id FROM notifications
         WHERE user_id = $1 AND type = 'team_invite' AND status = 'pending'
           AND data->>'teamId' = $2`,
        [userToInvite.id, teamId],
      );
      if (existingNotif.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "An invitation is already pending for this user" });
      }

      // 6. Get team name and inviter name
      const teamInfo = await query(`SELECT name FROM teams WHERE id = $1`, [
        teamId,
      ]);
      const teamName = teamInfo.rows[0]?.name || "a team";

      const inviterInfo = await query(`SELECT name FROM users WHERE id = $1`, [
        userId,
      ]);
      const inviterName = inviterInfo.rows[0]?.name || "Someone";

      // 7. Create notification for the invited user
      const notifResult = await query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, 'team_invite', $2, $3, $4)
         RETURNING *`,
        [
          userToInvite.id,
          "Team Invitation",
          `${inviterName} invited you to join "${teamName}"`,
          JSON.stringify({
            teamId,
            teamName,
            invitedBy: inviterName,
            inviterId: userId,
          }),
        ],
      );

      // 8. Record in invitations table too
      const existingInvite = await query(
        `SELECT id FROM invitations WHERE email = $1 AND team_id = $2 AND status = 'pending'`,
        [email, teamId],
      );
      if (existingInvite.rows.length === 0) {
        await query(
          `INSERT INTO invitations (email, team_id, invited_by, status) VALUES ($1, $2, $3, 'pending')`,
          [email, teamId, userId],
        );
      }

      // 9. Send real-time notification via Socket.IO
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${userToInvite.id}`).emit("notification:new", {
          notification: notifResult.rows[0],
        });
      }

      res.json({
        message: `Invitation sent to ${userToInvite.name}. They'll see it in their notifications.`,
      });
    } catch (err) {
      console.error("inviteMember error:", err);
      res.status(500).json({ message: "Server error. Please try again." });
    }
  },
};

module.exports = TeamController;
