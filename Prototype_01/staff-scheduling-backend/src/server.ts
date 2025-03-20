import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db";
import scheduleRoutes from "./routes/scheduleRoutes";
import userRoutes from "./routes/userRoutes";
import performanceRoutes from "./routes/performanceRoutes";

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/schedules", scheduleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/performance", performanceRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("🔴 Shutting down server...");
  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log("✅ Server closed.");
  process.exit(0);
});
