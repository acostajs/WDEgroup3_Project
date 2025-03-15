import express from "express";
import { createSchedule, getSchedules } from "../controllers/scheduleController";

const router = express.Router();

router.post("/", createSchedule);
router.get("/", getSchedules);

export default router;
