const express = require("express");

const router = express.Router();

const quizController =
require("../controllers/quizzesController");

const authenticateToken =
require("../middleware/authMiddleware");


// GET quizzes by folder
router.get(
  "/folder/:folder_id",
  authenticateToken,
  quizController.getQuizzesByFolder
);


// CREATE quiz
router.post(
  "/create",
  authenticateToken,
  quizController.createQuiz
);


// SUBMIT answer
router.put(
  "/submit/:id",
  authenticateToken,
  quizController.submitQuizAnswer
);


// DELETE quiz
router.delete(
  "/:id",
  authenticateToken,
  quizController.deleteQuiz
);


module.exports = router;