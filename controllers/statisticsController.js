const db = require("../db/database");


// GET statistics
exports.getStatistics = (req, res) => {
  const user_id = req.user.id;
  db.get(
    `
    SELECT *
    FROM statistics
    WHERE user_id = ?
    `,
    [user_id],

    (err, row) => {

      if (err) {
        return res.status(500).json(err);
      }

      if (!row) {
        return res.status(404).json({
          error: "Statistics not found"
        });
      }

      // Convert seconds into readable format
      const appHours = Math.floor(
        row.total_app_usage_seconds / 3600
      );

      const appMinutes = Math.floor(
        (row.total_app_usage_seconds % 3600) / 60
      );

      const studyHours = Math.floor(
        row.total_flashcard_study_seconds / 3600
      );

      const studyMinutes = Math.floor(
        (row.total_flashcard_study_seconds % 3600) / 60
      );

      res.json({

        average_score_percent:
          row.average_score_percent,

        total_quizzes_taken:
          row.total_quizzes_taken,

        total_app_usage_seconds:
          row.total_app_usage_seconds,

        total_flashcard_study_seconds:
          row.total_flashcard_study_seconds,

        total_app_usage_readable:
          `${appHours}h ${appMinutes}m`,

        total_flashcard_study_readable:
          `${studyHours}h ${studyMinutes}m`

      });

    }
  );

};


// UPDATE quiz statistics
exports.updateQuizStatistics = (req, res) => {

  const user_id = req.user.id;

  // SAFE DESTRUCTURING
  const {
    score,
    totalQuestions
  } = req.body || {};

  if (!score || !totalQuestions) {
    return res.status(400).json({
      error: "Missing fields"
    });
  }

  // Calculate percentage
  const percentage =
    (score / totalQuestions) * 100;

  db.run(
    `
    UPDATE statistics
    SET

      total_quiz_score_percent =
        total_quiz_score_percent + ?,

      total_quizzes_taken =
        total_quizzes_taken + 1,

      average_score_percent =
        (total_quiz_score_percent + ?)
        /
        (total_quizzes_taken + 1),

      updated_at = CURRENT_TIMESTAMP

    WHERE user_id = ?
    `,
    [
      percentage,
      percentage,
      user_id
    ],

    function (err) {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({

        message:
          "Quiz statistics updated",

        latest_score_percent:
          percentage.toFixed(2)

      });

    }
  );

};


// UPDATE flashcard study time
exports.updateStudyTime = (req, res) => {

  const user_id = req.user.id;

  // SAFE DESTRUCTURING
  const { seconds } = req.body || {};

  if (!seconds) {
    return res.status(400).json({
      error: "Seconds required"
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
        return res.status(500).json(err);
      }

      res.json({

        message:
          "Study time updated",

        added_seconds:
          seconds

      });

    }
  );

};


// UPDATE app usage time
exports.updateAppUsageTime = (req, res) => {

  const user_id = req.user.id;

  // SAFE DESTRUCTURING
  const { seconds } = req.body || {};

  if (!seconds) {
    return res.status(400).json({
      error: "Seconds required"
    });
  }

  db.run(
    `
    UPDATE statistics
    SET

      total_app_usage_seconds =
        total_app_usage_seconds + ?,

      updated_at = CURRENT_TIMESTAMP

    WHERE user_id = ?
    `,
    [seconds, user_id],

    function (err) {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({

        message:
          "App usage updated",

        added_seconds:
          seconds

      });

    }
  );

};