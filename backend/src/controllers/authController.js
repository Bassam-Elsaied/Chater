import { generateToken } from "../lib/utils.js";
import User from "../models/Users.js";
import bcrypt from "bcryptjs";

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate all fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check if email already exists
    const existEmail = await User.findOne({ email });
    if (existEmail)
      return res.status(409).json({ message: "User already exists" });

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePic: "",
    });

    // Generate token and save user
    if (newUser) {
      await newUser.save();
      generateToken(res, newUser._id);

      res.status(201).json({
        message: "User created successfully",
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          profilePic: newUser.profilePic,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid user data" });
    }

    // Error handling
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internel server error" });
  }
};

export { register };
