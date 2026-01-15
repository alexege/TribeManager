import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    icon: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Optional: normalize names (e.g. "raid-target" → "Raid-Target")
// categorySchema.pre("save", function (next) {
//   if (this.name) {
//     this.name = this.name.trim();
//   }
//   next();
// });

export default mongoose.model("Category", categorySchema);
