import mongoose from "mongoose";

const PerformanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    efficiencyScore: { type: Number, required: true, min: 0, max: 100 }, // Added validation
    attendance: { type: Number, required: true, min: 0, max: 100 }, // Added validation
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

export default mongoose.model("Performance", PerformanceSchema);
