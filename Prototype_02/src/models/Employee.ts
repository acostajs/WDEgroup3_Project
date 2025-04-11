import mongoose, { Schema, Document } from 'mongoose';

// Interface defining the structure of an Employee document (for TypeScript)
export interface IEmployee extends Document {
  name: string;
  position: string;
  email: string;
  hourly_rate?: number; // Optional field
  // Mongoose automatically adds _id
}

// Mongoose Schema definition
const EmployeeSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required.'],
    trim: true, // Removes leading/trailing whitespace
    index: true // Add index for faster searching by name
  },
  position: {
    type: String,
    required: [true, 'Position is required.'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true, // Ensure email is unique in the collection
    lowercase: true, // Store email in lowercase
    trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Basic email format validation
    index: true
  },
  hourly_rate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative.']
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create and export the Mongoose model
export default mongoose.model<IEmployee>('Employee', EmployeeSchema);