const express = require("express");

const router = express.Router();

const flashcardsController =
require("../controllers/flashcardsController");

const authenticateToken =
require("../middleware/authMiddleware");


// GET all flashcards by folder
router.get(
  "/folder/:folder_id",
  authenticateToken,
  flashcardsController.getFlashcardsByFolder
);


// GET single flashcard
router.get(
  "/:id",
  authenticateToken,
  flashcardsController.getFlashcardById
);


// RANDOM flashcards
router.get(
  "/random/:folder_id",
  authenticateToken,
  flashcardsController.getRandomFlashcards
);


// SEARCH flashcards
router.get(
  "/search/query",
  authenticateToken,
  flashcardsController.searchFlashcards
);


// UPDATE study time
router.post(
  "/study-time",
  authenticateToken,
  flashcardsController.markFlashcardStudied
);


module.exports = router;