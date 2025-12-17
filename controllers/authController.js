const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwtUtils");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, address, state, country, city, pincode } = req.body;

    if (!name || !email || !phone || !password || !address || !state || !country || !city || !pincode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      state,
      country,
      city,
      pincode,
      profile_image: req.file ? req.file.path : null,
      role: "user",
      refreshTokens: []
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ message: "User registered successfully", user: userResponse });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: "Email/Phone and password required" });

    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in DB
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on prod
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.status(200).json({ message: "Login successful", user: userResponse, accessToken });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN LOGIN
const loginAdmin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: "Email and password required" });

    const admin = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }], role: "admin" });
    if (!admin) return res.status(401).json({ message: "Invalid admin credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid admin credentials" });

    // Generate tokens
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    admin.refreshTokens=[refreshToken];
    await admin.save();

    // Set cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.refreshTokens;

    res.status(200).json({ message: "Admin login successful", admin: adminResponse, accessToken });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// REFRESH TOKEN
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    const user = await User.findOne({ refreshTokens: token });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const newAccessToken = generateAccessToken(user);
      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT
const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({ message: "Already logged out" });
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshTokens: refreshToken });

    if (user) {
      // Remove refresh token from DB
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();
    }

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { registerUser, loginUser, refreshToken, logoutUser, loginAdmin };
