import express from "express";
import { createSchedule, getSchedules } from "../controllers/scheduleController";

const router = express.Router();

/**
 * @route   POST /api/schedules
 * @desc    Create a new schedule
 * @access  Public (consider adding authentication later)
 */
router.post("/", createSchedule);

/**
 * @route   GET /api/schedules
 * @desc    Get all schedules
 * @access  Public (consider adding authentication later)
 */
router.get("/", getSchedules);

export default router;
