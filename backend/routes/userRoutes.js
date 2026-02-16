const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.use(auth);

/* ── GET /api/users?search= ──────────────── */
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const users = search ? await User.search(search) : await User.findAll();
    res.json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
