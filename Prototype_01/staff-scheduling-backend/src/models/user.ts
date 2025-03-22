import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Removes whitespace
    },
    role: {
      type: String,
      enum: ["staff", "manager"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Ensures emails are stored in lowercase
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Invalid email format",
      ], // Regex for email validation
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Prevents weak passwords
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("User", UserSchema);
