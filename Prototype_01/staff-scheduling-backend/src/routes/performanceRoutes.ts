import express from "express";
import { getPerformance } from "../controllers/performanceController";

const router = express.Router();
router.get("/", getPerformance);
export default router;
