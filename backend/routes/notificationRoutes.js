const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/notificationController");

router.get("/", auth, ctrl.getNotifications);
router.get("/unread-count", auth, ctrl.getUnreadCount);
router.put("/:id/read", auth, ctrl.markAsRead);
router.put("/read-all", auth, ctrl.markAllAsRead);
router.post("/:id/accept", auth, ctrl.acceptInvite);
router.post("/:id/decline", auth, ctrl.declineInvite);

module.exports = router;
