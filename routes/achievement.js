const express = require("express");
const router = express.Router();
const achievementController = require("../controllers/achievementController");

router.get("/:userId", achievementController.getAchievements);

module.exports = router;