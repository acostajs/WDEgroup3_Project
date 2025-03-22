import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

// User Registration
export const registerUser = async (req: Request, res: Response) => {
  const { name, role, email, password } = req.body;

  if (!name || !role || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ name, role, email, password: hashedPassword });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// User Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};
