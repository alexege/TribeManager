import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
  {
    inGameName: {
      type: String,
      trim: true,
    },
    steamName: {
      type: String,
      trim: true,
    },
    discordName: {
      type: String,
      trim: true,
    },

    tribeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tribe",
      default: null,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    dateSeen: {
      type: String, // keep as string since you're using <input type="date">
    },

    notes: {
      type: String,
      default: "",
    },

    // OPTIONAL future link to auth account
    authUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // your Auth model
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Player", PlayerSchema);
