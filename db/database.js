const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
    if (err) {
        console.error("Database error: " , err.message);
    }
    else {
        console.log("Database connected successfully");
    }
});

// Create users table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  // Seed data only if empty
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
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