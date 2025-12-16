const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile_image: { type: String },
    address: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
