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
      f.subject,
      f.topic,
      f.difficulty,

      COUNT(c.id) AS card_quantity

    FROM folders f

    LEFT JOIN cards c
    ON f.id = c.folder_id

    WHERE f.user_id = ?

    GROUP BY f.id

    ORDER BY f.created_at DESC
    `,
    [user_id],

    (err, rows) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json(rows);

    }
  );

};


// CREATE folder
exports.createFolder = (req, res) => {

  const {
    folder_name,
    subject,
    topic,
    difficulty
  } = req.body || {};

  const user_id = req.user.id;

  if (
    !folder_name ||
    !subject ||
    !topic
  ) {
    return res.status(400).json({
      error: "Missing required fields"
    });
  }

  db.run(
    `
    INSERT INTO folders
    (
      user_id,
      folder_name,
      subject,
      topic,
      difficulty
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      user_id,
      folder_name,
      subject,
      topic,
      difficulty || "Beginner"
    ],

    async function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      await checkFolderAchievements(user_id);

      res.status(201).json({

        id: this.lastID,

        folder_name,
        subject,
        topic,

        difficulty:
          difficulty || "Beginner",

        card_quantity: 0

      });

    }
  );

};


// UPDATE folder
exports.updateFolder = (req, res) => {

  const { id } = req.params;

  const {
    folder_name,
    subject,
    topic,
    difficulty
  } = req.body || {};

  const user_id = req.user.id;

  if (
    !folder_name ||
    !subject ||
    !topic
  ) {
    return res.status(400).json({
      error: "Missing required fields"
    });
  }

  db.run(
    `
    UPDATE folders
    SET

      folder_name = ?,
      subject = ?,
      topic = ?,
      difficulty = ?

    WHERE id = ? AND user_id = ?
    `,
    [
      folder_name,
      subject,
      topic,
      difficulty || "Beginner",
      id,
      user_id
    ],

    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(403).json({
          error:
            "Unauthorized or folder not found"
        });
      }

      res.json({

        message:
          "Folder updated successfully",

        updatedFolder: {

          id,

          folder_name,
          subject,
          topic,

          difficulty:
            difficulty || "Beginner"

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
    `
    DELETE FROM folders
    WHERE id = ? AND user_id = ?
    `,
    [id, user_id],

    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(403).json({
          error:
            "Unauthorized or folder not found"
        });
      }

      res.json({
        message:
          "Folder deleted successfully"
      });

    }
  );

};