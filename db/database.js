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

  // Users 
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  // Folders
  db.run(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      folder_category TEXT NOT NULL,
      folder_name TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Cards
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

  // SEED USERS
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }

    if (row.count === 0) {
      db.run(`
        INSERT INTO users (username, password)
        VALUES 
        ('sixseven', '67676767'),
        ('nineeleven', '911911')
      `);
      console.log("Seed data inserted");
    }
  });

});

module.exports = db;