import mongoose from "mongoose";

const timerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["countdown", "stopwatch"], required: true },
    name: { type: String, required: true },
    categoryId: { type: String, required: true },
    order: { type: Number, default: 0 },
    image: { type: String, default: null },
    timer: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Number, default: () => Date.now() },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Number, default: () => Date.now() },
  },
  { _id: false }
);

const timerStateSchema = new mongoose.Schema(
  {
    stateKey: {
      type: String,
      default: "default",
      unique: true,
      index: true,
    },
    categories: [categorySchema],
    widgets: [timerSchema],
  },
  { timestamps: true }
);

export default mongoose.model("TimerState", timerStateSchema);
