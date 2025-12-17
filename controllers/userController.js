const User = require("../models/UserModel");

// GET ALL USERS (ADMIN)
const getAllUsers = async (req, res) => {
  const users = await User.find()
    .select("-password -refreshTokens")
    .sort({ createdAt: -1 }); // reverse order
  res.json(users);
};

// GET USER BY ID
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -refreshTokens");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// UPDATE USER
const updateUser = async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).select("-password -refreshTokens");
  res.json(updated);
};

// DELETE USER
const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
