import mongoose, { Schema, Document } from 'mongoose';
import { IEmployee } from './Employee';

export interface IPerformanceLog extends Document {
  employee: mongoose.Types.ObjectId | IEmployee; // Required link
  log_date: Date;
  rating?: number;
  notes?: string;
  recorded_at?: Date; // Will be set by timestamps:true option
  // Mongoose automatically adds _id
}

const PerformanceLogSchema: Schema = new Schema({
  employee: { // Required link to Employee
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  log_date: { // Just store as Date, time part isn't relevant here
    type: Date,
    required: true,
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: {
    type: String,
    trim: true
  }
  // 'recorded_at' is handled by timestamps option
}, {
  timestamps: { createdAt: 'recorded_at', updatedAt: false } // Use 'recorded_at' for creation, disable 'updatedAt'
});

export default mongoose.model<IPerformanceLog>('PerformanceLog', PerformanceLogSchema);