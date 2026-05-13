const db = require("../db/database");


// GET flashcards study session
exports.getFlashcardsByFolder = (req, res) => {

  const { folder_id } = req.params;

  const user_id = req.user.id;

  db.all(
    `
    SELECT
      id,
      card_name,
      question,
      answer,
      created_at
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


// GET single flashcard
exports.getFlashcardById = (req, res) => {

  const { id } = req.params;

  const user_id = req.user.id;

  db.get(
    `
    SELECT
      id,
      folder_id,
      card_name,
      question,
      answer,
      created_at
    FROM cards
    WHERE id = ?
    AND user_id = ?
    `,
    [id, user_id],

    (err, row) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          error: "Flashcard not found"
        });
      }

      res.json(row);

    }
  );

};


// RANDOMIZE flashcards
exports.getRandomFlashcards = (req, res) => {

  const { folder_id } = req.params;

  const user_id = req.user.id;

  db.all(
    `
    SELECT
      id,
      card_name,
      question,
      answer
    FROM cards
    WHERE folder_id = ?
    AND user_id = ?

    ORDER BY RANDOM()
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


// SEARCH flashcards
exports.searchFlashcards = (req, res) => {

  const { keyword } = req.query;

  const user_id = req.user.id;

  if (!keyword) {
    return res.status(400).json({
      error: "Keyword required"
    });
  }

  db.all(
    `
    SELECT
      id,
      folder_id,
      card_name,
      question,
      answer
    FROM cards
    WHERE user_id = ?
    AND
    (
      question LIKE ?
      OR answer LIKE ?
      OR card_name LIKE ?
    )

    ORDER BY created_at DESC
    `,
    [
      user_id,
      `%${keyword}%`,
      `%${keyword}%`,
      `%${keyword}%`
    ],

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


// MARK flashcard as studied
exports.markFlashcardStudied = (req, res) => {

  const user_id = req.user.id;

  const { seconds } = req.body || {};

  if (!seconds) {
    return res.status(400).json({
      error: "Study seconds required"
    });
  }

  db.run(
    `
    UPDATE statistics
    SET

      total_flashcard_study_seconds =
        total_flashcard_study_seconds + ?,

      updated_at = CURRENT_TIMESTAMP

    WHERE user_id = ?
    `,
    [seconds, user_id],

    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({

        message:
          "Flashcard study session recorded",

        added_seconds:
          seconds

      });

    }
  );

};