require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("adminentry", 10);

    await User.create({
      name: "Super Admin",
      email: "admin@gmail.com",
      phone: "7904441662",
      password: hashedPassword,
      address: "Admin Address",
      state: "Admin State",
      country: "Admin Country",
      city: "Admin City",
      pincode: "000000",
      role: "admin",
      refreshTokens: [],
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
