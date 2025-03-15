import { Request, Response } from "express";
import Performance from "../models/Performance";

// Get performance records
export const getPerformance = async (req: Request, res: Response) => {
  try {
    const performanceData = await Performance.find().populate("employeeId", "name role");
    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching performance data", error });
  }
};

// Create a performance entry
export const createPerformanceEntry = async (req: Request, res: Response) => {
  const { employeeId, efficiencyScore, attendance } = req.body;

  if (!employeeId || efficiencyScore == null || attendance == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newPerformance = new Performance({ employeeId, efficiencyScore, attendance });
    await newPerformance.save();
    res.status(201).json(newPerformance);
  } catch (error) {
    res.status(500).json({ message: "Error saving performance data", error });
  }
};
