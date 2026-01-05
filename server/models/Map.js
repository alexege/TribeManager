import mongoose from "mongoose";

const mapSchema = new mongoose.Schema(
  {
    baseMapName: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    img: {
      type: String,
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tribeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tribe",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Map", mapSchema);
