const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const cardController = require("../controllers/cardsController");

// Get cards in folder
router.get(
  "/folder/:folder_id",
  authenticateToken,
  cardController.getCardsByFolder
);

// Create card
router.post(
  "/create",
  authenticateToken,
  cardController.createCard
);

// Delete card
router.delete(
  "/:id",
  authenticateToken,
  cardController.deleteCard
);

// Update card
router.put(
  "/:id",
  authenticateToken,
  cardController.updateCard
);

module.exports = router;