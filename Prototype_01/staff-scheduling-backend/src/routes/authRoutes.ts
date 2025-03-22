import express from "express";
import { loginUser, registerUser } from "../controllers/authController";

const router = express.Router();

router.post("/login", loginUser); // Login and get JWT token
router.post("/register", registerUser); // Register new user

export default router;
