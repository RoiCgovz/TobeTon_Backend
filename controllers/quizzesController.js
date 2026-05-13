const db = require("../db/database");

// GET quizzes by folder
exports.getQuizzesByFolder = (req, res) => {
  const { folder_id } = req.params;
  const user_id = req.user.id;

  db.all(
    `
    SELECT *
    FROM quizzes
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

// CREATE quiz
exports.createQuiz = (req, res) => {

  const { folder_id } = req.body || {};

  const user_id = req.user.id;

  if (!folder_id) {
    return res.status(400).json({
      error: "Folder ID required"
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

      // GET random card
      db.get(
        `
        SELECT *
        FROM cards
        WHERE folder_id = ?
        ORDER BY RANDOM()
        LIMIT 1
        `,
        [folder_id],

        (err, card) => {

          if (err) {
            return res.status(500).json({
              error: err.message
            });
          }

          if (!card) {
            return res.status(404).json({
              error:
                "No cards found in folder"
            });
          }

          // GET 2 wrong answers
          db.all(
            `
            SELECT answer
            FROM cards
            WHERE folder_id = ?
            AND id != ?
            ORDER BY RANDOM()
            LIMIT 2
            `,
            [folder_id, card.id],

            (err, wrongAnswers) => {

              if (err) {
                return res.status(500).json({
                  error: err.message
                });
              }

              if (wrongAnswers.length < 2) {
                return res.status(400).json({
                  error:
                    "Need at least 3 cards in folder to generate quiz"
                });
              }

              const choices = [
                card.answer,
                wrongAnswers[0].answer,
                wrongAnswers[1].answer
              ];

              // SHUFFLE choices
              choices.sort(
                () => Math.random() - 0.5
              );

              const choice_a = choices[0];
              const choice_b = choices[1];
              const choice_c = choices[2];

              db.run(
                `
                INSERT INTO quizzes
                (
                  user_id,
                  folder_id,
                  card_id,

                  question,

                  choice_a,
                  choice_b,
                  choice_c,

                  correct_answer
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                  user_id,
                  folder_id,
                  card.id,

                  card.question,

                  choice_a,
                  choice_b,
                  choice_c,

                  card.answer
                ],

                function (err) {

                  if (err) {
                    return res.status(500).json({
                      error: err.message
                    });
                  }

                  res.status(201).json({

                    id: this.lastID,

                    question:
                      card.question,

                    choice_a,
                    choice_b,
                    choice_c
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};
// SUBMIT answer
exports.submitQuizAnswer = (req, res) => {

  const { id } = req.params;

  const { user_answer } = req.body || {};

  const user_id = req.user.id;

  if (!user_answer) {
    return res.status(400).json({
      error: "User answer required"
    });
  }

  db.get(
    `
    SELECT *
    FROM quizzes
    WHERE id = ?
    AND user_id = ?
    `,
    [id, user_id],

    (err, quiz) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (!quiz) {
        return res.status(404).json({
          error: "Quiz not found"
        });
      }

      const is_correct =
        quiz.correct_answer === user_answer
          ? 1
          : 0;

      db.run(
        `
        UPDATE quizzes
        SET

          user_answer = ?,
          is_correct = ?

        WHERE id = ?
        `,
        [
          user_answer,
          is_correct,
          id
        ],

        function (err) {

          if (err) {
            return res.status(500).json({
              error: err.message
            });
          }

          res.json({

            message:
              "Quiz answer submitted",

            is_correct

          });

        }
      );

    }
  );

};


// DELETE quiz
exports.deleteQuiz = (req, res) => {

  const { id } = req.params;

  const user_id = req.user.id;

  db.run(
    `
    DELETE FROM quizzes
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
            "Unauthorized or quiz not found"
        });
      }

      res.json({
        message:
          "Quiz deleted successfully"
      });

    }
  );

};