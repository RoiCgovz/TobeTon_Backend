const express = require("express");

const router = express.Router();

const {
  getStatistics,
  updateQuizStatistics,
  updateStudyTime,
  updateAppUsageTime
} = require("../controllers/statisticsController");


// IMPORT AUTH MIDDLEWARE
const authenticateToken =
  require("../middleware/authMiddleware");


// GET STATISTICS
router.get(
  "/",
  authenticateToken,
  getStatistics
);


// UPDATE QUIZ STATS
router.put(
  "/quiz",
  authenticateToken,
  updateQuizStatistics
);


// UPDATE STUDY TIME
router.put(
  "/study-time",
  authenticateToken,
  updateStudyTime
);


// UPDATE APP USAGE
router.put(
  "/app-usage",
  authenticateToken,
  updateAppUsageTime
);

module.exports = router;