const db = require("../db/database");

// Get Achievements
exports.getAchievements = (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT a.id, a.title, a.description,
    CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END AS earned
    FROM achievements a
    LEFT JOIN user_achievements ua
    ON a.id = ua.achievement_id AND ua.user_id = ?
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};

// Check Achievement for Folder
exports.checkFolderAchievements = (userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as total FROM folders WHERE user_id = ?`,
      [userId],
      (err, row) => {
        if (err) return reject(err);

        db.all(
          `
          SELECT * FROM achievements
          WHERE condition_type = 'folders_created'
          AND condition_value <= ?
          `,
          [row.total],
          (err, achievements) => {
            if (err) return reject(err);

            achievements.forEach((a) => {
              db.run(
                `
                INSERT OR IGNORE INTO user_achievements (user_id, achievement_id)
                VALUES (?, ?)
                `,
                [userId, a.id]
              );
            });

            resolve();
          }
        );
      }
    );
  });
};