import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Improves query performance
    },
    shiftStart: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: any, value: Date) {
          return value < this.shiftEnd;
        },
        message: "Shift start must be before shift end",
      },
    },
    shiftEnd: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);

export default mongoose.model("Schedule", ScheduleSchema);
