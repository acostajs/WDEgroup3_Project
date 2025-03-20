import { Request, Response } from "express";
import Schedule from "../models/Schedule";

/**
 * @route   POST /api/schedules
 * @desc    Create a new schedule
 * @access  Public (consider adding authentication)
 */
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, shift } = req.body;

    // Basic validation
    if (!employeeId || !date || !shift) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const schedule = await Schedule.create({ employeeId, date, shift });
    res.status(201).json(schedule);
  } catch (error) {
    console.error("❌ Error creating schedule:", error);
    res.status(500).json({ error: "Failed to create schedule", details: error });
  }
};

/**
 * @route   GET /api/schedules
 * @desc    Get all schedules
 * @access  Public
 */
export const getSchedules = async (_req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find().populate({
      path: "employeeId",
      select: "name role", // Only fetch necessary fields
    });
    res.json(schedules);
  } catch (error) {
    console.error("❌ Error fetching schedules:", error);
    res.status(500).json({ error: "Failed to fetch schedules", details: error });
  }
};
