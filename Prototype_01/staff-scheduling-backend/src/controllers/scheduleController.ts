import { Request, Response } from "express";
import Schedule from "../models/Schedule";

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: "Failed to create schedule" });
  }
};

export const getSchedules = async (_req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find().populate("employeeId");
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
};
