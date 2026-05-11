const db = require("../db/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();


// REGISTER
exports.register = async (req, res) => {

  const {
    username,
    password
  } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password required"
    });
  }

  try {

    const hashedPassword =
      await bcrypt.hash(password, 10);

    db.run(
      `
      INSERT INTO users
      (username, password)
      VALUES (?, ?)
      `,
      [username, hashedPassword],

      function (err) {

        if (err) {

          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({
              error: "Username already exists"
            });
          }

          return res.status(500).json({
            error: "Database error"
          });
        }

        // CREATE STATISTICS ROW
        db.run(
          `
          INSERT INTO statistics (user_id)
          VALUES (?)
          `,
          [this.lastID]
        );

        res.json({
          message: "User registered",
          userId: this.lastID
        });

      }
    );

  }
  catch (err) {

    res.status(500).json({
      error: "Server error"
    });

  }

};


// LOGIN
exports.login = (req, res) => {

  const {
    username,
    password
  } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password required"
    });
  }

  db.get(
    `
    SELECT *
    FROM users
    WHERE username = ?
    `,
    [username],

    async (err, user) => {

      if (err) {
        return res.status(500).json({
          error: "Database error"
        });
      }

      if (!user) {
        return res.status(400).json({
          error: "Invalid credentials"
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          error: "Invalid credentials"
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h"
        }
      );

      res.json({
        message: "Login successful",
        token
      });

    }
  );

};


// UPDATE USERNAME
exports.updateUsername = (req, res) => {

  const {
    userId,
    newUsername
  } = req.body || {};

  if (!newUsername) {
    return res.status(400).json({
      error: "New username required"
    });
  }

  db.run(
    `
    UPDATE users
    SET username = ?
    WHERE id = ?
    `,
    [newUsername, userId],

    function(err) {

      if (err) {

        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({
            error: "Username already exists"
          });
        }

        return res.status(500).json({
          error: "Database error"
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "User not found"
        });
      }

      res.json({
        message: "Username updated successfully"
      });

    }
  );

};


// UPDATE PASSWORD
exports.updatePassword = async (req, res) => {

  const {
    userId,
    currentPassword,
    newPassword
  } = req.body || {};

  if (
    !currentPassword ||
    !newPassword
  ) {
    return res.status(400).json({
      error:
        "Current and new password required"
    });
  }

  try {

    db.get(
      `
      SELECT *
      FROM users
      WHERE id = ?
      `,
      [userId],

      async (err, user) => {

        if (err) {
          return res.status(500).json({
            error: "Database error"
          });
        }

        if (!user) {
          return res.status(404).json({
            error: "User not found"
          });
        }

        const isMatch =
          await bcrypt.compare(
            currentPassword,
            user.password
          );

        if (!isMatch) {
          return res.status(400).json({
            error:
              "Current password incorrect"
          });
        }

        const hashedPassword =
          await bcrypt.hash(
            newPassword,
            10
          );

        db.run(
          `
          UPDATE users
          SET password = ?
          WHERE id = ?
          `,
          [hashedPassword, userId],

          function(err) {

            if (err) {
              return res.status(500).json({
                error: "Database error"
              });
            }

            res.json({
              message:
                "Password updated successfully"
            });

          }
        );

      }
    );
  }
  catch (err) {
    res.status(500).json({
      error: "Server error"
    });
  }
};