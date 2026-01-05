import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    mapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Map",
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    x: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    y: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    label: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
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
  }
);

export default mongoose.model("Point", pointSchema);
