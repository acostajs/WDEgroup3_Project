import mongoose, { Document, Schema, Types } from 'mongoose';
import { IEmployee } from './Employee'; // Import Employee type if needed elsewhere

export interface IShift extends Document {
  shift_date: Date;
  start_time: string; // e.g., "10:00"
  end_time: string;   // e.g., "18:00"
  required_position: string;
  assigned_employee: Types.ObjectId | IEmployee | null; // Reference to Employee
  // Add any other fields like notes, actual_start/end, performance_log_ref etc.
}

const ShiftSchema: Schema = new Schema({
  shift_date: { type: Date, required: true },
  start_time: { type: String, required: true }, // Added
  end_time: { type: String, required: true },   // Added
  required_position: { type: String, required: true, index: true },
  assigned_employee: { type: Schema.Types.ObjectId, ref: 'Employee', default: null, index: true },
  // Add other fields here
}, { timestamps: true }); // Adds createdAt and updatedAt

// Index for faster querying by date range
ShiftSchema.index({ start_time: 1, end_time: 1 });

export default mongoose.model<IShift>('Shift', ShiftSchema);