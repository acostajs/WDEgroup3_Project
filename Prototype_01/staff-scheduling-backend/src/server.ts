import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db";
import scheduleRoutes from "./routes/scheduleRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/schedules", scheduleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/performance", performanceRoutes);app.use("/api/schedules", scheduleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
