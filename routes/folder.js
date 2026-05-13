const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const folderController = require("../controllers/folderController");

// Get all folders
router.get("/get", authenticateToken, folderController.getAllFolders);

// Create folder
router.post("/create", authenticateToken, folderController.createFolder);

// Delete folder
router.delete("/:id", authenticateToken, folderController.deleteFolder);

// Update folder
router.put("/:id", authenticateToken, folderController.updateFolder);

module.exports = router;