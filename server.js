require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

require("./db/database");
 
const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);



app.get("/" , (req, res) => {
    res.send("API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});