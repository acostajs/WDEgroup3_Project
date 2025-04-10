import mongoose, { Schema, Document } from 'mongoose';
import { IEmployee } from './Employee'; // Import Employee type if needed elsewhere

export interface IShift extends Document {
  employee?: mongoose.Types.ObjectId | IEmployee; // Can be null/undefined if unassigned
  start_time: Date;
  end_time: Date;
  required_position: string;
  // Mongoose automatically adds _id
}

const ShiftSchema: Schema = new Schema({
  // Link to the Employee collection, store ObjectId
  // Make it optional (nullable) by not setting required: true
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee', // Reference to the 'Employee' model
    index: true
  },
  start_time: {
    type: Date,
    required: true,
    index: true
  },
  end_time: {
    type: Date,
    required: true
  },
  required_position: {
    type: String,
    required: true,
    trim: true,
    index: true
  }
}, {
  timestamps: true // Adds createdAt, updatedAt
});

// Index for faster querying by date range
ShiftSchema.index({ start_time: 1, end_time: 1 });

export default mongoose.model<IShift>('Shift', ShiftSchema);