import mongoose from "mongoose";

const PerformanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  efficiencyScore: { type: Number, required: true },
  attendance: { type: Number, required: true },
});

export default mongoose.model("Performance", PerformanceSchema);
