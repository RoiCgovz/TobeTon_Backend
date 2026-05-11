const db = require("../db/database");
const { checkFolderAchievements } = require("./achievementController");

// GET all folders (with card count)
exports.getAllFolders = (req, res) => {
  const user_id = req.user.id;

  db.all(
    `
    SELECT 
      f.id,
      f.folder_name,
      f.folder_category,
      COUNT(c.id) AS card_quantity
    FROM folders f
    LEFT JOIN cards c ON f.id = c.folder_id
    WHERE f.user_id = ?
    GROUP BY f.id
    `,
    [user_id],
    (err, rows) => {
      if (err) return res.status(500).json(err);

      res.json(rows);
    }
  );
};

// CREATE folder
exports.createFolder = (req, res) => {
  const { folder_category, folder_name } = req.body;
  const user_id = req.user.id;

  if (!folder_category || !folder_name) {
    return res.status(400).json({
      error: "Missing fields"
    });
  }

  db.run(
    `INSERT INTO folders (user_id, folder_category, folder_name)
     VALUES (?, ?, ?)`,
    [user_id, folder_category, folder_name],
    async function (err) {

      if (err) {
        return res.status(500).json(err);
      }

      await checkFolderAchievements(user_id);

      res.json({
        id: this.lastID,
        folder_category,
        folder_name,
        card_quantity: 0
      });
    }
  );
};

// UPDATE folder
exports.updateFolder = (req, res) => {
  const { id } = req.params;

  const {
    folder_category,
    folder_name
  } = req.body;

  const user_id = req.user.id;

  if (!folder_category || !folder_name) {
    return res.status(400).json({
      error: "Missing fields"
    });
  }

  db.run(
    `
    UPDATE folders
    SET
      folder_category = ?,
      folder_name = ?
    WHERE id = ? AND user_id = ?
    `,
    [
      folder_category,
      folder_name,
      id,
      user_id
    ],
    function (err) {

      if (err) {
        return res.status(500).json(err);
      }

      if (this.changes === 0) {
        return res.status(403).json({
          error: "Unauthorized or folder not found"
        });
      }

      res.json({
        message: "Folder updated successfully",
        updatedFolder: {
          id,
          folder_category,
          folder_name
        }
      });
    }
  );
};

// DELETE folder
exports.deleteFolder = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.run(
    `DELETE FROM folders WHERE id = ? AND user_id = ?`,
    [id, user_id],
    function (err) {

      if (err) {
        return res.status(500).json(err);
      }

      if (this.changes === 0) {
        return res.status(403).json({
          error: "Unauthorized"
        });
      }

      res.json({
        message: "Folder deleted"
      });
    }
  );
};