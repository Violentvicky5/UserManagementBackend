const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // <--- add this
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users")
const app = express();
connectDB();
const URL =  process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: URL, // your frontend URL
  credentials: true // allow cookies
}));
app.use(express.json());
app.use(cookieParser()); // <--- add this
app.use("/api/auth", authRoutes);
app.use("/api/users",usersRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
