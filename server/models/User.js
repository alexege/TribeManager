import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      enum: ["user", "admin", "moderator"],
      default: ["user"],
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
