const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Get all users
router.get("/", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

// Get one user
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json(err);
    res.json(row || {});
  });
});

// Create users 
router.post("/", (req, res) => {
  const { username, password } = req.body;
  db.run(
    `INSERT INTO users (username, password)
     VALUES (?, ?)`,
    [username, password],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

// Update users
router.put("/:id", (req, res) => {
  const { username, password } = req.body;

  db.run(
    `UPDATE users 
    SET username=?, password=? 
    WHERE id=?`,
    [username, password, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: this.changes });
    }
  );
});

// Delete users
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ deleted: this.changes });
  });
});

module.exports = router;