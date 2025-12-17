const express = require("express");
const router = express.Router();
const { registerUser, loginUser, refreshToken, logoutUser, loginAdmin  } = require("../controllers/authController");
const multer = require("multer");
const path = require("path");



//multer for uplaoding 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  if (["image/jpeg", "image/png"].includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG and PNG files are allowed"), false);
};

const upload = multer({ storage, fileFilter });

router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.get("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
router.post("/admin/login", loginAdmin);

module.exports = router;
