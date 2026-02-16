const Label = require("../models/Label");

/* ── POST /api/boards/:id/labels ─────────── */
exports.createLabel = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const label = await Label.create(req.params.id, {
      name: name.trim(),
      color,
    });
    res.status(201).json(label);
  } catch (err) {
    console.error("createLabel error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── PUT /api/boards/:id/labels/:labelId ──── */
exports.updateLabel = async (req, res) => {
  try {
    const { name, color } = req.body;
    const label = await Label.update(req.params.labelId, { name, color });
    if (!label) return res.status(404).json({ message: "Label not found" });
    res.json(label);
  } catch (err) {
    console.error("updateLabel error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ── DELETE /api/boards/:id/labels/:labelId ─ */
exports.deleteLabel = async (req, res) => {
  try {
    await Label.delete(req.params.labelId);
    res.json({ message: "Label deleted" });
  } catch (err) {
    console.error("deleteLabel error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
