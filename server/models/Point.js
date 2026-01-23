import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    mapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Map",
      required: true,
      index: true,
    },

    // Category/icon for the point
    category: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },

    icon: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    // Absolute pixel coordinates
    x: {
      type: Number,
      required: true,
    },

    y: {
      type: Number,
      required: true,
    },

    // Percentage coordinates (for responsive positioning)
    pX: {
      type: Number,
      required: true,
    },

    pY: {
      type: Number,
      required: true,
    },

    // Display name for the point
    name: {
      type: String,
      trim: true,
      default: "",
    },

    // Description/notes
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Visual properties
    color: {
      type: String,
      default: "#ff0000",
    },

    size: {
      type: Number,
      default: 10,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Point", pointSchema);
