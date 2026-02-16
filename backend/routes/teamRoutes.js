const express = require("express");
const router = express.Router();
const TeamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/auth");

// All routes require auth
router.use(authMiddleware);

router.post("/", TeamController.createTeam);
router.get("/", TeamController.getMyTeams);
router.get("/:teamId/members", TeamController.getTeamMembers);
router.post("/:teamId/invite", TeamController.inviteMember);
router.post("/invite-app", TeamController.sendAppInvite);

module.exports = router;
