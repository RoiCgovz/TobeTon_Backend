const express = require("express");
const router = express.Router();
const db = require("../db/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

// Register
router.post("/register" , async (req, res) =>{
    const {username,password} = req.body;

    // test if exists
    if (!username || !password){
        return res.status(400).json({ error: "Username and password required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            `INSERT INTO users (username, password) VALUES (?, ?)`,
            [username, hashedPassword],
            function (err) {
                if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(400).json({ error: "Username already exists" });
                }
                return res.status(500).json({ error: "Database error" });
                }

                res.json({
                message: "User registered",
                userId: this.lastID
                });
            }
        );
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Login
router.post("/login", (req, res) => {
    const {username, password} = req.body;

    // test if exists
    if (!username || !password){
        return res.status(400).json({ error: "Username and password does not exist" });
    }
    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        async (err, user) => {
            if (err) return res.status(500).json({ error: "Database error" });

            if (!user) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.json({
                message: "Login successful",
                token
            });
        }
    );
});



module.exports = router;