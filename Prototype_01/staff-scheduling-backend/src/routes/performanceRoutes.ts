import express from "express";
import { getPerformance, createPerformanceEntry } from "../controllers/performanceController";
import { authMiddleware } from "../middleware/authMiddleware"; // Protect routes if needed

const router = express.Router();

router.get("/", authMiddleware, getPerformance); // Requires authentication
router.post("/", authMiddleware, createPerformanceEntry); // Requires authentication

export default router;
