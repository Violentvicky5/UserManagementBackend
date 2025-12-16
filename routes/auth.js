const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// Import multer
const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder to save images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

// File filter (optional, only jpg/png)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Add multer middleware to register route
router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);

module.exports = router;
