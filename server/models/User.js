import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    tribeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tribe",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
