import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shiftStart: { type: Date, required: true },
  shiftEnd: { type: Date, required: true },
});

export default mongoose.model("Schedule", ScheduleSchema);
