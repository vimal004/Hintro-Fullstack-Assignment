const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { query } = require("../config/db");

const SALT_ROUNDS = 10;
const AVATAR_COLORS = ["#1a73e8", "#e8710a", "#1e8e3e", "#a142f4", "#d93025"];

/**
 * Derive 1–2 character initials from a full name.
 */
const deriveInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/**
 * Pick a random avatar accent colour.
 */
const pickColor = () =>
  AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

/**
 * Sign a JWT with the user's id and email.
 */
const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

// ──────────────────────────────────────────────
//  POST /api/auth/register
// ──────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ──
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }
    if (password.length < 4) {
      return res
        .status(400)
        .json({ message: "Password must be at least 4 characters" });
    }

    // ── Duplicate check ──
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // ── Create user ──
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      initials: deriveInitials(name),
      color: pickColor(),
    });

    const token = signToken(user);

    // ── Process Pending Invitations ──
    try {
      const pendingInvites = await query(
        `SELECT * FROM invitations WHERE email = $1 AND status = 'pending'`,
        [email.toLowerCase()],
      );

      if (pendingInvites.rows.length > 0) {
        console.log(
          `Processing ${pendingInvites.rows.length} pending invites for ${email}`,
        );

        for (const invite of pendingInvites.rows) {
          // Check if already a member (idempotency)
          const memberCheck = await query(
            `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`,
            [invite.team_id, user.id],
          );

          if (memberCheck.rows.length === 0) {
            // Add to team
            await query(
              `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member')`,
              [invite.team_id, user.id],
            );
          }

          // Update invitation status
          await query(
            `UPDATE invitations SET status = 'accepted' WHERE id = $1`,
            [invite.id],
          );
        }
      }
    } catch (inviteErr) {
      console.error("Error processing pending invites:", inviteErr);
      // Don't fail the registration if invite processing fails
    }

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ──────────────────────────────────────────────
//  POST /api/auth/login
// ──────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Strip password from response
    const { password: _, ...safeUser } = user;
    const token = signToken(safeUser);
    return res.status(200).json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ──────────────────────────────────────────────
//  GET /api/auth/me   (protected)
// ──────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
