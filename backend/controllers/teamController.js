const { query } = require("../config/db");
const nodemailer = require("nodemailer");

// Simple in-memory or env-based transporter for now
// In production, use real credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

  /* ── Invite Member ──────────────────────── */
  async inviteMember(req, res) {
    const { teamId } = req.params;
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
      // 1. Check permissions (must be member of team)
      const roleCheck = await query(
        `SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2`,
        [teamId, userId],
      );
      if (roleCheck.rows.length === 0) {
        return res.status(403).json({ message: "Access denied" });
      }

      // 2. Check if user exists
      const userResult = await query(`SELECT * FROM users WHERE email = $1`, [
        email,
      ]);
      const userToInvite = userResult.rows[0];

      if (!userToInvite) {
        // User does not exist -> Create invitation record & Send App Invite
        /*
        We return 404 with a specific code so frontend can prompt:
        "User not found. Send invitation to join app?"
        */
        return res.status(404).json({
          message: "User not found",
          code: "USER_NOT_FOUND",
          email,
        });
      }

      // 3. Check if already member
      const existingMember = await query(
        `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`,
        [teamId, userToInvite.id],
      );
      if (existingMember.rows.length > 0) {
        return res.status(400).json({ message: "User is already a member" });
      }

      // 4. Add member directly (simplifying flow: auto-add if user exists)
      // Alternatively, we could create an invitation entry.
      // For this task, "add team members thru mailids" -> implies direct addition or invite.
      // Let's do direct add for simplicity if they exist, or maybe invitation if we want to be strict.
      // The prompt says "send invite/ add team members".
      // Let's add them directly to `team_members` for instant collaboration if they exist.

      await query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member')`,
        [teamId, userToInvite.id],
      );

      // Notify via socket if online? (handled elsewhere usually)

      res.json({ message: "Member added successfully", member: userToInvite });
    } catch (err) {
      console.error("inviteMember error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  /* ── Send App Invite ────────────────────── */
  async sendAppInvite(req, res) {
    const { email, teamId } = req.body;
    const userId = req.user.id;

    // In a real app, this would send an email with a link like https://app.com/signup?ref=teamId
    // For now, we simulate sending email.

    console.log(
      `📧 Sending App Invite to ${email} from user ${userId} for team ${teamId}`,
    );

    // If we had valid credentials
    /*
    await transporter.sendMail({
      from: '"TaskFlow" <noreply@taskflow.com>',
      to: email,
      subject: "You've been invited to join TaskFlow",
      text: "Join us at ..."
    });
    */

    // We still record the invitation in DB
    try {
      await query(
        `INSERT INTO invitations (email, team_id, invited_by) VALUES ($1, $2, $3) RETURNING *`,
        [email, teamId, userId],
      );

      res.json({ message: `Invitation sent to ${email}` });
    } catch (err) {
      console.error("sendAppInvite error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = TeamController;
