const Activity = require("../models/Activity");

/* ── GET /api/boards/:id/activities ──────── */
exports.getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const result = await Activity.findByBoard(req.params.id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    res.json(result);
  } catch (err) {
    console.error("getActivities error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
