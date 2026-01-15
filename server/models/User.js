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
    profilePicture: {
        type: String,
        default: null
    },
    roles: {
      type: [String],
      enum: ["ROLE_USER", "ROLE_ADMIN", "ROLE_MODERATOR"],
      default: ["ROLE_USER"],
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
