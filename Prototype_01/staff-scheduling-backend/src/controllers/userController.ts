import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs"; // For password hashing

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public (Consider making it private in the future)
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // Exclude password from response
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public (Consider adding authentication)
 */
export const createUser = async (req: Request, res: Response) => {
  const { name, role, email, password } = req.body;

  if (!name || !role || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, role, email, password: hashedPassword });
    await newUser.save();

    // Exclude password in response
    res.status(201).json({
      _id: newUser.id,
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
    });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};
