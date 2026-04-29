const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
  if (err) {
    console.error("Database error:", err.message);
  } else {
    console.log("Database connected successfully");
  }
});

db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON`);

  // Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  // Folders Table
  db.run(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      folder_category TEXT NOT NULL,
      folder_name TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Cards Table
  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folder_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      card_name TEXT,
      question TEXT,
      answer TEXT,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Achievements Table
  db.run(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT UNIQUE,
      description TEXT,
      condition_type TEXT,
      condition_value INTEGER
    )
  `);

  // User Achievements
  db.run(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      achievement_id INTEGER,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
    )
  `);

  // Sample Users
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row.count === 0) {
      db.run(`
        INSERT INTO users (username, password)
        VALUES 
        ('sixseven', '67676767'),
        ('nineeleven', '911911')
      `);
    }
  });

  // Insert Achievements
  db.get("SELECT COUNT(*) as count FROM achievements", (err, row) => {
    if (row.count === 0) {
      db.run(`
        INSERT INTO achievements (title, description, condition_type, condition_value)
        VALUES
        ('5 Folders Created', 'Create 5 folders', 'folders_created', 5),
        ('10 Folders Created', 'Create 10 folders', 'folders_created', 10),
        ('5 Day Streak', 'Study for 5 days straight', 'streak', 5)
      `);
    }
  });
});

module.exports = db;