const db = require("../db/database");


// GET cards by folder
exports.getCardsByFolder = (req, res) => {

  const { folder_id } = req.params;

  const user_id = req.user.id;

  db.all(
    `
    SELECT *
    FROM cards
    WHERE folder_id = ?
    AND user_id = ?

    ORDER BY created_at DESC
    `,
    [folder_id, user_id],

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


// CREATE card
exports.createCard = (req, res) => {

  const {
    folder_id,
    card_name,
    question,
    answer
  } = req.body || {};

  const user_id = req.user.id;

  if (
    !folder_id ||
    !question ||
    !answer
  ) {
    return res.status(400).json({
      error: "Missing required fields"
    });
  }

  // CHECK folder ownership
  db.get(
    `
    SELECT *
    FROM folders
    WHERE id = ?
    AND user_id = ?
    `,
    [folder_id, user_id],

    (err, folder) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (!folder) {
        return res.status(403).json({
          error:
            "Unauthorized folder access"
        });
      }

      db.run(
        `
        INSERT INTO cards
        (
          folder_id,
          user_id,
          card_name,
          question,
          answer
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          folder_id,
          user_id,
          card_name,
          question,
          answer
        ],

        function (err) {

          if (err) {
            return res.status(500).json({
              error: err.message
            });
          }

          res.status(201).json({

            id: this.lastID,

            folder_id,

            card_name,
            question,
            answer

          });

        }
      );

    }
  );

};


// UPDATE card
exports.updateCard = (req, res) => {

  const { id } = req.params;

  const {
    card_name,
    question,
    answer
  } = req.body || {};

  const user_id = req.user.id;

  if (!question || !answer) {
    return res.status(400).json({
      error: "Missing required fields"
    });
  }

  db.run(
    `
    UPDATE cards
    SET

      card_name = ?,
      question = ?,
      answer = ?

    WHERE id = ?
    AND user_id = ?
    `,
    [
      card_name,
      question,
      answer,
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
            "Unauthorized or card not found"
        });
      }

      res.json({

        message:
          "Card updated successfully",

        updatedCard: {

          id,

          card_name,
          question,
          answer

        }

      });

    }
  );

};


// DELETE card
exports.deleteCard = (req, res) => {

  const { id } = req.params;

  const user_id = req.user.id;

  db.run(
    `
    DELETE FROM cards
    WHERE id = ?
    AND user_id = ?
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
            "Unauthorized or card not found"
        });
      }

      res.json({
        message:
          "Card deleted successfully"
      }); 
    }
  );
};