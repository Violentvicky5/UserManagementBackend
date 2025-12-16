const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, address, state, country, city, pincode } = req.body;

    if (!name || !email || !phone || !password || !address || !state || !country || !city || !pincode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(409).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
      role: "user"
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

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ message: "Login successful", user: userResponse });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
