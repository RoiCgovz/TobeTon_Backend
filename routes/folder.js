const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const folderController = require("../controllers/folderController");

// Get all folders
router.get("/", authenticateToken, folderController.getAllFolders);

// Create folder
router.post("/", authenticateToken, folderController.createFolder);

// Delete folder
router.delete("/:id", authenticateToken, folderController.deleteFolder);

module.exports = router;