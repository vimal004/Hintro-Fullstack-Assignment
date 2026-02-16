const router = require("express").Router();
const auth = require("../middleware/auth");

const boardCtrl = require("../controllers/boardController");
const listCtrl = require("../controllers/listController");
const taskCtrl = require("../controllers/taskController");
const activityCtrl = require("../controllers/activityController");
const labelCtrl = require("../controllers/labelController");

// All routes are protected
router.use(auth);

/* ── Boards ──────────────────────────────── */
router.get("/", boardCtrl.getBoards);
router.post("/", boardCtrl.createBoard);
router.get("/:id", boardCtrl.getBoard);
router.put("/:id", boardCtrl.updateBoard);
router.delete("/:id", boardCtrl.deleteBoard);

/* ── Board Members ───────────────────────── */
router.post("/:id/members", boardCtrl.addMember);
router.delete("/:id/members/:userId", boardCtrl.removeMember);

/* ── Lists ───────────────────────────────── */
router.post("/:boardId/lists", listCtrl.createList);
router.put("/:boardId/lists/reorder", listCtrl.reorderLists);
router.put("/:boardId/lists/:listId", listCtrl.updateList);
router.delete("/:boardId/lists/:listId", listCtrl.deleteList);

/* ── Tasks ───────────────────────────────── */
router.post("/:boardId/lists/:listId/tasks", taskCtrl.createTask);
router.put("/:boardId/tasks/:taskId", taskCtrl.updateTask);
router.delete("/:boardId/tasks/:taskId", taskCtrl.deleteTask);
router.put("/:boardId/tasks/:taskId/move", taskCtrl.moveTask);

/* ── Activities ──────────────────────────── */
router.get("/:id/activities", activityCtrl.getActivities);

/* ── Labels ──────────────────────────────── */
router.post("/:id/labels", labelCtrl.createLabel);
router.put("/:id/labels/:labelId", labelCtrl.updateLabel);
router.delete("/:id/labels/:labelId", labelCtrl.deleteLabel);

module.exports = router;
